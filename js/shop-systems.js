function learnTalent(talentId) {
    let targetTalent;
    let branchKey = Object.keys(talentTreeData).find(key => talentTreeData[key].talents.some(t => t.id === talentId));
    if(branchKey){targetTalent=talentTreeData[branchKey].talents.find(t=>t.id===talentId);}
    if (!targetTalent) return;
    const currentLevel = player.talents[talentId] || 0;
    if (currentLevel >= targetTalent.maxLevel) {
        gameMessage.textContent = '此天賦已達最高等級！';
        return;}
    if (player.sp < targetTalent.cost) {
        gameMessage.textContent = '技能點不足！';
        return;}
    if(targetTalent.requires){const requiredTalentLevel=player.talents[targetTalent.requires.id]||0;if(requiredTalentLevel<targetTalent.requires.level){gameMessage.textContent='需要先學習前置天賦！';return;}}
    player.sp -= targetTalent.cost;
    player.talents[talentId] = (player.talents[talentId] || 0) + 1;
    targetTalent.applyEffect(player.talents[talentId]);
    gameMessage.textContent = `成功學習「${targetTalent.name}」！`;
    updateAllDisplays();}
function updateCraftingPreview() {
    const playerSelection = {};
    let totalItemsUsed = 0;
    
    document.querySelectorAll('.craft-input').forEach(input => {
        const itemName = input.dataset.itemName;
        let quantity = parseInt(input.value) || 0;
        const maxQuantity = parseInt(input.max);
        
        if (quantity > maxQuantity) {
            quantity = maxQuantity;
            input.value = maxQuantity;
        }
        if (quantity < 0) {
            quantity = 0;
            input.value = 0;
        }
        if (quantity > 0) {
            playerSelection[itemName] = quantity;
        }
        totalItemsUsed += quantity;
    });

    // 使用 WeaponUtils.calculateStats 计算属性
    const stats = WeaponUtils.calculateStats(playerSelection);
    
    const previewHpElement = document.getElementById('preview-hp');
    if (previewHpElement) {
        previewHpElement.textContent = stats.hp;
    }
    document.getElementById('preview-atk').textContent = stats.atk;
    document.getElementById('preview-spd').textContent = stats.spd;
    document.getElementById('preview-fragments').textContent = totalItemsUsed;

    const craftButton = document.getElementById('craft-weapon-button');
    const matchedRecipe = specialRecipes.find(recipe => {
        if (recipe.requiredDimension && recipe.requiredDimension !== currentDimension) return false;
        if (recipe.name === "月見 II" && (!player.backpack["月見 I"] || player.backpack["月見 I"] < 1)) return false;
        if (recipe.name === "月見 III" && (!player.backpack["月見 II"] || player.backpack["月見 II"] < 1)) return false;
        return WeaponUtils.checkRecipeMatch(playerSelection, recipe.composition).match;
    });

    if (matchedRecipe) {
        craftButton.disabled = false;
        document.getElementById('preview-fragments').textContent += ` / ${Object.values(matchedRecipe.composition).reduce((a, b) => a + b, 0)}`;
    } else {
        craftButton.disabled = totalItemsUsed !== 8;
        document.getElementById('preview-fragments').textContent += " / 8";
    }
}
function craftWeapon() {
    let playerSelection = {};
    let totalItemsUsed = 0;
    
    document.querySelectorAll('.craft-input').forEach(input => {
        const quantity = parseInt(input.value) || 0;
        if (quantity > 0) {
            playerSelection[input.dataset.itemName] = quantity;
            totalItemsUsed += quantity;
        }
    });
    
    const useHilt = document.getElementById('use-hilt-checkbox')?.checked || false;
    
    // 检查配方匹配
    const matchedRecipeResult = specialRecipes
        .map(r => ({ 
            recipe: r, 
            ...WeaponUtils.checkRecipeMatch(playerSelection, r.composition) 
        }))
        .find(res => {
            if (!res.match) return false;
            if (res.recipe.exclusiveTo && !player.profession.includes(res.recipe.exclusiveTo)) return false;
            if (res.recipe.requiredDimension && res.recipe.requiredDimension !== currentDimension) return false;
            if (res.recipe.name === "月見 II" && (!player.backpack["月見 I"] || player.backpack["月見 I"] < 1)) {
                return false;
            }
            if (res.recipe.name === "月見 III" && (!player.backpack["月見 II"] || player.backpack["月見 II"] < 1)) {
                return false;
            }
            return true;
        });

    if (!matchedRecipeResult && totalItemsUsed !== 8) {
        gameMessage.textContent = "武器打造需要剛好使用 8 個碎片或符合特殊配方！";
        return;
    }

    // 记录发现的配方
    specialRecipes.forEach(recipe => {
        if (!player.discoveredRecipes[recipe.name]) {
            player.discoveredRecipes[recipe.name] = {};
        }
        for (const craftedItem in playerSelection) {
            if (craftedItem === '暗影碎片') continue;
            const craftedQty = playerSelection[craftedItem];
            if (recipe.composition[craftedItem] && recipe.composition[craftedItem] === craftedQty) {
                if (!player.discoveredRecipes[recipe.name][craftedItem]) {
                    player.discoveredRecipes[recipe.name][craftedItem] = true;
                }
            }
        }
    });

    // 处理材料配方
    if (matchedRecipeResult && matchedRecipeResult.recipe.type === 'material') {
        WeaponUtils.consumeMaterials(matchedRecipeResult.recipe.composition);
        
        let shadowsToConsume = matchedRecipeResult.shadowsNeeded;
        if (shadowsToConsume > 0) {
            player.backpack['暗影碎片'] = (player.backpack['暗影碎片'] || 0) - shadowsToConsume;
            if (player.backpack['暗影碎片'] <= 0) delete player.backpack['暗影碎片'];
        }
        
        addItemToBackpack(matchedRecipeResult.recipe.name, 1);
        gameMessage.textContent = matchedRecipeResult.recipe.specialEffect;
        updateAllDisplays();
        if (tabBackpack.classList.contains('active')) renderBackpack();
        return;
    }

    // 移除当前武器
    WeaponUtils.removeCurrentWeapon();

    let finalHP = 0, finalATK = 0, finalSPD = 0;
    let weaponName = "自製武器";
    let successMessage = "";

    if (matchedRecipeResult) {
        const recipeToCraft = matchedRecipeResult.recipe;
        weaponName = recipeToCraft.name;
        successMessage = `你成功打造了傳奇物品：${recipeToCraft.specialEffect}`;
        
        // 消耗材料
        WeaponUtils.consumeMaterials(recipeToCraft.composition);
        
        let shadowsToConsume = matchedRecipeResult.shadowsNeeded;
        if (shadowsToConsume > 0 && (player.efficientCraftingChance || 0) > 0 && Math.random() < player.efficientCraftingChance) {
            shadowsToConsume--;
            successMessage += " (你幸運地節省了一枚暗影碎片！)";
        }
        
        if (shadowsToConsume > 0) {
            player.backpack['暗影碎片'] = (player.backpack['暗影碎片'] || 0) - shadowsToConsume;
            if (player.backpack['暗影碎片'] <= 0) delete player.backpack['暗影碎片'];
        }
        
        finalHP = recipeToCraft.bonusStats.hp || 0;
        finalATK = recipeToCraft.bonusStats.atk || 0;
        finalSPD = recipeToCraft.bonusStats.spd || 0;
        
        // 应用武器特殊效果
        WeaponUtils.applyWeaponSpecialEffects(recipeToCraft);
    } else {
        // 普通打造
        WeaponUtils.consumeMaterials(playerSelection);
        
        if (useHilt) {
            if (!player.backpack["青光劍柄"] || player.backpack["青光劍柄"] <= 0) {
                gameMessage.textContent = "你沒有青光劍柄！";
                return;
            }
            player.backpack["青光劍柄"]--;
            if (player.backpack["青光劍柄"] === 0) delete player.backpack["青光劍柄"];
            weaponName = "青光劍";
        }
        
        const stats = WeaponUtils.calculateStats(playerSelection);
        finalHP = stats.hp;
        finalATK = stats.atk;
        finalSPD = stats.spd;
        
        successMessage = `新武器「${weaponName}」打造成功！HP+${finalHP}, ATK+${finalATK}, SPD+${finalSPD}！`;
    }

    // 短命方块武器不加HP
    if (player.profession.includes("短命方塊")) {
        finalHP = 0;
        if (successMessage.includes('HP+')) {
            successMessage = successMessage.replace(/HP[+-]?\d+,\s*/, '');
            successMessage = successMessage.replace(/HP\+\d+,?\s*/, '');
        }
    }

    // 装备新武器
    player.weaponStats = { 
        name: weaponName, 
        hp: finalHP, 
        atk: finalATK, 
        spd: finalSPD, 
        composition: { ...playerSelection } 
    };
    
    player.maxHp += finalHP;
    player.hp += finalHP;
    if (player.hp <= 0) player.hp = 1;
    
    if (player.profession.includes("刺客")) {
        player.attackMax += finalATK;
    } else {
        player.attackMin += finalATK;
        player.attackMax += finalATK;
    }
    
    player.speed += finalSPD;
    
    checkAndUnlockSwordLight();
    gameMessage.textContent = successMessage;
    updateAllDisplays();
    if (tabBackpack.classList.contains('active')) renderBackpack();
}
function checkAndUnlockSwordLight() { const weapon = player.weaponStats; const composition = weapon.composition; if (weapon.name === "青光劍" && composition && composition["鋼劍方塊碎片"] >= 1) { if (!player.abilities["劍光"]?.learned) { learnAbility("劍光"); gameMessage.textContent = "手持特製的青光劍，你領悟了新技能：「劍光」！"; } } }
function learnAbility(abilityName) { const abilityDef = allAbilities[abilityName]; if (player.abilities[abilityName]?.learned) return false; if (abilityDef.spCost > 0 && player.sp < abilityDef.spCost) { gameMessage.textContent = '技能點不足！'; return false; } if (player.level < abilityDef.levelRequired) { gameMessage.textContent = `等級不足 (需要等級 ${abilityDef.levelRequired})。`; return false; } if (abilityDef.spCost > 0) player.sp -= abilityDef.spCost; player.abilities[abilityName] = { learned: true, level: 0, currentPP: abilityDef.basePP, maxPP: abilityDef.basePP }; if (abilityDef.spCost > 0) gameMessage.textContent = `你學習了招式：「${abilityName}」！`; updateDisplay(); return true; }
function upgradeAbility(abilityName) { const abilityDef = allAbilities[abilityName]; const playerAbility = player.abilities[abilityName]; if (!playerAbility) return; if (abilityDef.maxLevel && playerAbility.level >= abilityDef.maxLevel) { gameMessage.textContent = `「${abilityName}」已達最高等級！`; return; } if (player.sp < abilityDef.upgradeCostSP) { gameMessage.textContent = '技能點不足！'; return; } player.sp -= abilityDef.upgradeCostSP; playerAbility.level++; playerAbility.maxPP = abilityDef.basePP + (abilityDef.getIncreasedPP(playerAbility.level) || 0); playerAbility.currentPP = playerAbility.maxPP; if (player.profession.includes("刺客") && abilityName === '劍光') { const minAtkBoost = abilityDef.getMinDamageBoost(1); player.attackMin += minAtkBoost; gameMessage.textContent = `「劍光」升級成功！最低攻擊力永久提升 ${minAtkBoost}！目前等級 Lv.${playerAbility.level}！`; } else { gameMessage.textContent = `「${abilityName}」升級成功！目前等級 Lv.${playerAbility.level}！`; } updateDisplay(); }
function togglePriorityAbility(abilityName) { player.priorityAbility = (player.priorityAbility === abilityName) ? null : abilityName; gameMessage.textContent = player.priorityAbility ? `已將「${abilityName}」設為優先。` : `已取消「${abilityName}」的優先。`; updateDisplay(); }
function synthesizeItem(recipeId, sourceFragmentName = null) {
    if (recipeId !== 'shadow_fragment' || !sourceFragmentName) {
        console.error("無效的合成呼叫:", recipeId, sourceFragmentName);
        gameMessage.textContent = '合成錯誤！';
        return;
    }
    if ((player.backpack[sourceFragmentName] || 0) < 10) {
        gameMessage.textContent = '材料不足！';
        return;
    }
    const synthCost = getDiscountedCost(100);
    if (currentMoney < synthCost) {
        gameMessage.textContent = '金錢不足！';
        return;
    }
    currentMoney -= synthCost;
    player.totalMoneySpent += synthCost;
    player.backpack[sourceFragmentName] -= 10;
    if (player.backpack[sourceFragmentName] <= 0) {
        delete player.backpack[sourceFragmentName];
    }
    addItemToBackpack('暗影碎片', 1);
    gameMessage.textContent = `成功使用 10 個【${sourceFragmentName}】合成 1 個【暗影碎片】！`;
    updateAllDisplays();
}
function buyRandomUpgrade() {
    const cost = 50;
    if (currentMoney < cost) {
        gameMessage.textContent = '金錢不足！';
        return;
    }
    currentMoney -= cost;
    player.totalMoneySpent += cost;
    const possibleUpgrades = [
        { type: 'attackMax', amount: currentItemCosts.attackUpgrade.amount, name: '最高攻擊' },
        { type: 'maxHp', amount: currentItemCosts.maxHPUpgrade.amount, name: '血量上限' },
        { type: 'speed', amount: baseItemValues.speedUpgrade.amount, name: '速度' },
        { type: 'xp', amount: baseItemValues.buyXP.amount, name: '經驗值' }
    ];
    const randomUpgrade = possibleUpgrades[Math.floor(Math.random() * possibleUpgrades.length)];
    let message = `你感受到了混亂的力量！`;
    switch (randomUpgrade.type) {
        case 'attackMax':
            player.attackMax += randomUpgrade.amount;
            message += `最高攻擊力提升了 ${randomUpgrade.amount}！`;
            break;
        case 'maxHp':
            player.maxHp += randomUpgrade.amount;
            player.hp += randomUpgrade.amount;
            message += `血量上限提升了 ${randomUpgrade.amount}！`;
            break;
        case 'speed':
            player.speed += randomUpgrade.amount;
            message += `速度提升了 ${randomUpgrade.amount}！`;
            break;
        case 'xp':
            gainXP(randomUpgrade.amount);
            message += `獲得了 ${randomUpgrade.amount} 經驗值！`;
            break;
    }
    gameMessage.textContent = message;
    updateDisplay();
}
function addItemToBackpack(item, quantity = 1) { 
    if (typeof item === 'string') { 
        player.backpack[item] = (player.backpack[item] || 0) + quantity; 
    } else if (typeof item === 'object' && item.name) { 
        if (!player.backpack[item.name]) { 
            player.backpack[item.name] = []; 
        } 
        for(let i = 0; i < quantity; i++) { 
            player.backpack[item.name].push(item); 
        }}}