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
    let totalHP = 0, totalATK = 0, totalSPD = 0;
    let totalItemsUsed = 0;
    const playerSelection = {};
    document.querySelectorAll('.craft-input').forEach(input => {
        const itemName = input.dataset.itemName; 
        let quantity = parseInt(input.value) || 0; 
        const maxQuantity = parseInt(input.max); 
        if (quantity > maxQuantity) { quantity = maxQuantity; input.value = maxQuantity; } 
        if (quantity < 0) { quantity = 0; input.value = 0; } 
        if (quantity > 0) {
            playerSelection[itemName] = quantity;
        }
        totalItemsUsed += quantity;
        if (fragmentStats[itemName]) { 
            totalHP += (fragmentStats[itemName].hp || 0) * quantity; 
            totalATK += (fragmentStats[itemName].atk || 0) * quantity; 
            totalSPD += (fragmentStats[itemName].spd || 0) * quantity; 
        }});
    const previewHpElement = document.getElementById('preview-hp');
    if(previewHpElement){previewHpElement.textContent = totalHP;}
    document.getElementById('preview-atk').textContent = totalATK; 
    document.getElementById('preview-spd').textContent = totalSPD; 
    document.getElementById('preview-fragments').textContent = totalItemsUsed;
    const craftButton = document.getElementById('craft-weapon-button');
    const matchedRecipe = specialRecipes.find(recipe => {
        if(recipe.requiredDimension&&recipe.requiredDimension!==currentDimension){return false;}
        if(recipe.name==="月見 II"&&(!player.backpack["月見 I"]||player.backpack["月見 I"]<1)){return false;}
        if(recipe.name==="月見 III"&&(!player.backpack["月見 II"]||player.backpack["月見 II"]<1)){return false;}
        return isRecipeMatch(playerSelection, recipe.composition).match;});
    if (matchedRecipe) {
        craftButton.disabled = false;
        document.getElementById('preview-fragments').textContent += ` / ${Object.values(matchedRecipe.composition).reduce((a,b)=>a+b,0)}`;
    } else {
        craftButton.disabled = totalItemsUsed !== 8;
        document.getElementById('preview-fragments').textContent += " / 8";
    }}
function removeSpecialWeaponEffects() {
    player.damageToShield = 0;
    player.weaponMoneyBonus = 0;
    player.rampingAttack = 0;
    player.bonusCritDamage = 0;
    player.recoilDamagePercent = 0;
    player.turnStartHeal = 0;
    player.turnSkipChance = 0;
    player.damageSpillover = false;
    const oldWeaponName = player.weaponStats.name;
    const oldRecipe = specialRecipes.find(r => r.name === oldWeaponName);
    if (oldRecipe && oldRecipe.bonusStats) {
        if (oldRecipe.bonusStats.flatDamageReduction) player.flatDamageReduction -= oldRecipe.bonusStats.flatDamageReduction;
        if (oldRecipe.bonusStats.bleedChance) player.bleedChance -= oldRecipe.bonusStats.bleedChance;
        if (oldRecipe.bonusStats.bleedDamagePercentage) player.bleedDamagePercentage -= oldRecipe.bonusStats.bleedDamagePercentage;
        if (oldRecipe.bonusStats.reflectDamage) player.reflectDamage -= oldRecipe.bonusStats.reflectDamage;
        if (oldRecipe.bonusStats.evasion) player.evasion -= oldRecipe.bonusStats.evasion;
        if (oldRecipe.bonusStats.critChance) player.critChance -= oldRecipe.bonusStats.critChance;
    }}
function craftWeapon() {
    let playerSelection = {};
    let totalItemsUsed = 0;
    document.querySelectorAll('.craft-input').forEach(input => {
        const quantity = parseInt(input.value) || 0;
        if (quantity > 0) {
            playerSelection[input.dataset.itemName] = quantity;
            totalItemsUsed += quantity;
        }});
    const useHilt = document.getElementById('use-hilt-checkbox')?.checked || false;
    const matchedRecipeResult = specialRecipes.map(r => ({ recipe: r, ...isRecipeMatch(playerSelection, r.composition) }))
        .find(res => {
            if (!res.match) return false;
            if (res.recipe.exclusiveTo && !player.profession.includes(res.recipe.exclusiveTo)) return false;
            if (res.recipe.requiredDimension && res.recipe.requiredDimension !== currentDimension) return false;
            if (res.recipe.name === "月見 II" && (!player.backpack["月見 I"] || player.backpack["月見 I"] < 1)) {
                return false;}
            if (res.recipe.name === "月見 III" && (!player.backpack["月見 II"] || player.backpack["月見 II"] < 1)) {
                return false;}return true;});
    if (!matchedRecipeResult && totalItemsUsed !== 8) {
         gameMessage.textContent = "武器打造需要剛好使用 8 個碎片或符合特殊配方！";
         return;
    }
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
                }}}});
    if (matchedRecipeResult) {
        const recipeToCraft = matchedRecipeResult.recipe;
        if (recipeToCraft.name === "月見 II" && (!player.backpack["月見 I"] || player.backpack["月見 I"] < 1)) {
            gameMessage.textContent = "製作【月見 II】需要背包中至少有一個【月見 I】！";
            return;
        }
        if (recipeToCraft.name === "月見 III" && (!player.backpack["月見 II"] || player.backpack["月見 II"] < 1)) {
            gameMessage.textContent = "製作【月見 III】需要背包中至少有一個【月見 II】！";
            return;
        }
        if (recipeToCraft.type === 'material') {
            for(const [itemName, requiredCount] of Object.entries(recipeToCraft.composition)) {
                player.backpack[itemName] -= requiredCount;
                if(player.backpack[itemName] <= 0) delete player.backpack[itemName];
            }
            let shadowsToConsume = matchedRecipeResult.shadowsNeeded;
            if (shadowsToConsume > 0) {
                player.backpack['暗影碎片'] = (player.backpack['暗影碎片'] || 0) - shadowsToConsume;
                if(player.backpack['暗影碎片'] <= 0) delete player.backpack['暗影碎片'];
            }
            addItemToBackpack(recipeToCraft.name, 1);
            gameMessage.textContent = recipeToCraft.specialEffect;
            updateAllDisplays();
            if(tabBackpack.classList.contains('active')) renderBackpack();
            return;
        }}
    const oldWeaponName = player.weaponStats.name;
    const oldRecipe = specialRecipes.find(r => r.name === oldWeaponName);
    player.maxHp -= player.weaponStats.hp;
    if(player.hp > player.maxHp) player.hp = player.maxHp;
    if (player.profession.includes("刺客")) { 
        player.attackMax -= player.weaponStats.atk; 
    } else { 
        player.attackMin -= player.weaponStats.atk; 
        player.attackMax -= player.weaponStats.atk; 
    }
    player.speed -= player.weaponStats.spd;
    if (oldRecipe && oldRecipe.bonusStats) {
        if (oldRecipe.bonusStats.flatDamageReduction) player.flatDamageReduction -= oldRecipe.bonusStats.flatDamageReduction;
        if (oldRecipe.bonusStats.bleedChance) player.bleedChance -= oldRecipe.bonusStats.bleedChance;
        if (oldRecipe.bonusStats.bleedDamagePercentage) player.bleedDamagePercentage -= oldRecipe.bonusStats.bleedDamagePercentage;
        if (oldRecipe.bonusStats.reflectDamage) player.reflectDamage -= oldRecipe.bonusStats.reflectDamage;
        if (oldRecipe.bonusStats.evasion) player.evasion -= oldRecipe.bonusStats.evasion;
        if (oldRecipe.bonusStats.critChance) player.critChance -= oldRecipe.bonusStats.critChance;
    }
    player.damageToShield = 0;
    player.weaponMoneyBonus = 0;
    player.rampingAttack = 0;
    player.bonusCritDamage = 0;
    player.recoilDamagePercent = 0;
    player.turnStartHeal = 0;
    player.turnSkipChance = 0;
    player.damageSpillover = false;
    let finalHP = 0, finalATK = 0, finalSPD = 0;
    let weaponName = "自製武器";
    let successMessage = "";
    if (matchedRecipeResult) {
        const recipeToCraft = matchedRecipeResult.recipe;
        weaponName = recipeToCraft.name;
        successMessage = `你成功打造了傳奇物品：${recipeToCraft.specialEffect}`;
        for(const [itemName, requiredCount] of Object.entries(recipeToCraft.composition)) {
            player.backpack[itemName] -= requiredCount;
            if(player.backpack[itemName] <= 0) delete player.backpack[itemName];
        }
        let shadowsToConsume = matchedRecipeResult.shadowsNeeded;
        if (shadowsToConsume > 0 && (player.efficientCraftingChance || 0) > 0 && Math.random() < player.efficientCraftingChance) {
            shadowsToConsume--;
            successMessage += " (你幸運地節省了一枚暗影碎片！)";
        }
        if (shadowsToConsume > 0) {
            player.backpack['暗影碎片'] = (player.backpack['暗影碎片'] || 0) - shadowsToConsume;
            if(player.backpack['暗影碎片'] <= 0) delete player.backpack['暗影碎片'];
        }
        finalHP = recipeToCraft.bonusStats.hp || 0;
        finalATK = recipeToCraft.bonusStats.atk || 0;
        finalSPD = recipeToCraft.bonusStats.spd || 0;
        if(recipeToCraft.bonusStats.bleedChance) player.bleedChance += recipeToCraft.bonusStats.bleedChance;
        if(recipeToCraft.bonusStats.bleedDamagePercentage) player.bleedDamagePercentage += recipeToCraft.bonusStats.bleedDamagePercentage;
        if(recipeToCraft.bonusStats.reflectDamage) player.reflectDamage += recipeToCraft.bonusStats.reflectDamage;
        if(recipeToCraft.bonusStats.evasion) player.evasion += recipeToCraft.bonusStats.evasion;
        if(recipeToCraft.bonusStats.flatDamageReduction) player.flatDamageReduction += recipeToCraft.bonusStats.flatDamageReduction;
        if(recipeToCraft.bonusStats.critChance) player.critChance += recipeToCraft.bonusStats.critChance;
        if (recipeToCraft.name === "霸者之證") player.turnStartHeal = 150; 
        if (recipeToCraft.name === "時序斷層之刃") player.turnSkipChance = 0.65; 
        if (recipeToCraft.name === "影舞者之吻") player.damageToShield = 0.25;
        if (recipeToCraft.name === "永恆怒火") player.rampingAttack = 100;
        if (recipeToCraft.name === "黃金之觸") player.weaponMoneyBonus = 0.50;
        if (recipeToCraft.name === "神賜") player.turnSkipChance = 0.15;
        if (recipeToCraft.name === "澗月") player.damageSpillover = true;
    } else {
        for (const [itemName, quantity] of Object.entries(playerSelection)) {
             player.backpack[itemName] -= quantity;
             if (player.backpack[itemName] <= 0) delete player.backpack[itemName];
             if (fragmentStats[itemName] && itemName !== '暗影碎片') {
                 finalHP += (fragmentStats[itemName].hp || 0) * quantity;
                 finalATK += (fragmentStats[itemName].atk || 0) * quantity;
                 finalSPD += (fragmentStats[itemName].spd || 0) * quantity;
             }
        }
        if (useHilt) {
            if (!player.backpack["青光劍柄"] || player.backpack["青光劍柄"] <= 0) {
                 gameMessage.textContent = "你沒有青光劍柄！"; return;
            }
            player.backpack["青光劍柄"]--;
            if (player.backpack["青光劍柄"] === 0) delete player.backpack["青光劍柄"];
            weaponName = "青光劍";
        }
        successMessage = `新武器「${weaponName}」打造成功！HP+${finalHP}, ATK+${finalATK}, SPD+${finalSPD}！`;
    }
    if (player.profession.includes("短命方塊")) {
        finalHP = 0; // 短命方塊武器不加HP
        if (successMessage.includes('HP+')) {
             successMessage = successMessage.replace(/HP[+-]?\d+,\s*/, '');
             successMessage = successMessage.replace(/HP\+\d+,?\s*/, '');
        }}
    player.weaponStats = { name: weaponName, hp: finalHP, atk: finalATK, spd: finalSPD, composition: { ...playerSelection } };
    player.maxHp += finalHP;
    player.hp += finalHP;
    if(player.hp <= 0) player.hp = 1;
    if (player.profession.includes("刺客")) { player.attackMax += finalATK; } 
    else { player.attackMin += finalATK; player.attackMax += finalATK; }
    player.speed += finalSPD;
    checkAndUnlockSwordLight();
    gameMessage.textContent = successMessage;
    updateAllDisplays();
    if(tabBackpack.classList.contains('active')) renderBackpack();
}
function isRecipeMatch(playerSelection, recipeComposition) {
    const selectionKeys = Object.keys(playerSelection);
    const recipeKeys = Object.keys(recipeComposition);
    let shadowsNeeded = 0;
    const availableShadows = playerSelection['暗影碎片'] || 0;
    const otherItemsSelected = selectionKeys.some(key => key !== '暗影碎片');
    if (!otherItemsSelected && availableShadows > 0) {
        return { match: false, shadowsNeeded: 0 };
    }
    const totalPlayerItems = Object.values(playerSelection).reduce((sum, count) => sum + count, 0);
    const totalRecipeItems = Object.values(recipeComposition).reduce((sum, count) => sum + count, 0);
    if (totalPlayerItems !== totalRecipeItems) {
        return { match: false, shadowsNeeded: 0 };
    }
    if (selectionKeys.filter(k => k !== '暗影碎片').length > recipeKeys.length) {
        return { match: false, shadowsNeeded: 0 };
    }
    for (const requiredItem of recipeKeys) {
        if (!selectionKeys.includes(requiredItem)) {
            shadowsNeeded += recipeComposition[requiredItem];
        }
    }
    for (const selectedItem of selectionKeys) {
        if (selectedItem === '暗影碎片') continue;
        if (!recipeKeys.includes(selectedItem)) {
             return { match: false, shadowsNeeded: 0 };
        }
        if (playerSelection[selectedItem] < recipeComposition[selectedItem]) {
            shadowsNeeded += recipeComposition[selectedItem] - playerSelection[selectedItem];
        } else if (playerSelection[selectedItem] > recipeComposition[selectedItem]) {
            return { match: false, shadowsNeeded: 0 };
        }
    }
    if (shadowsNeeded <= availableShadows) {
        return { match: true, shadowsNeeded: shadowsNeeded };
    }
    return { match: false, shadowsNeeded: 0 };
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