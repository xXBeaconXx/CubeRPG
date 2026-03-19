// ====================================================
// UTILITY FUNCTIONS - 通用工具函数
// ====================================================

// 武器相关工具函数
const WeaponUtils = {
    // 移除当前武器效果
    removeCurrentWeapon() {
        // 移除基础属性
        player.maxHp -= player.weaponStats.hp;
        if (player.hp > player.maxHp) player.hp = player.maxHp;
        
        if (player.profession.includes("刺客")) {
            player.attackMax -= player.weaponStats.atk;
        } else {
            player.attackMin -= player.weaponStats.atk;
            player.attackMax -= player.weaponStats.atk;
        }
        player.speed -= player.weaponStats.spd;

        // 移除旧配方的特殊效果
        const oldRecipe = specialRecipes.find(r => r.name === player.weaponStats.name);
        if (oldRecipe?.bonusStats) {
            const stats = oldRecipe.bonusStats;
            if (stats.flatDamageReduction) player.flatDamageReduction -= stats.flatDamageReduction;
            if (stats.bleedChance) player.bleedChance -= stats.bleedChance;
            if (stats.bleedDamagePercentage) player.bleedDamagePercentage -= stats.bleedDamagePercentage;
            if (stats.reflectDamage) player.reflectDamage -= stats.reflectDamage;
            if (stats.evasion) player.evasion -= stats.evasion;
            if (stats.critChance) player.critChance -= stats.critChance;
        }

        // 重置武器带来的状态标志
        player.damageToShield = 0;
        player.weaponMoneyBonus = 0;
        player.rampingAttack = 0;
        player.bonusCritDamage = 0;
        player.recoilDamagePercent = 0;
        player.turnStartHeal = 0;
        player.turnSkipChance = 0;
        player.damageSpillover = false;
    },

    // 应用武器特殊效果
    applyWeaponSpecialEffects(recipe) {
        if (!recipe?.bonusStats) return;
        
        const stats = recipe.bonusStats;
        if (stats.bleedChance) player.bleedChance += stats.bleedChance;
        if (stats.bleedDamagePercentage) player.bleedDamagePercentage += stats.bleedDamagePercentage;
        if (stats.reflectDamage) player.reflectDamage += stats.reflectDamage;
        if (stats.evasion) player.evasion += stats.evasion;
        if (stats.flatDamageReduction) player.flatDamageReduction += stats.flatDamageReduction;
        if (stats.critChance) player.critChance += stats.critChance;

        // 特定武器效果
        switch (recipe.name) {
            case "霸者之證": player.turnStartHeal = 150; break;
            case "時序斷層之刃": player.turnSkipChance = 0.65; break;
            case "影舞者之吻": player.damageToShield = 0.25; break;
            case "永恆怒火": player.rampingAttack = 100; break;
            case "黃金之觸": player.weaponMoneyBonus = 0.50; break;
            case "神賜": player.turnSkipChance = 0.15; break;
            case "澗月": player.damageSpillover = true; break;
        }
    },

    // 计算武器属性
    calculateStats(selection) {
        let totalHP = 0, totalATK = 0, totalSPD = 0;
        for (const [itemName, qty] of Object.entries(selection)) {
            const stats = fragmentStats[itemName];
            if (stats) {
                totalHP += (stats.hp || 0) * qty;
                totalATK += (stats.atk || 0) * qty;
                totalSPD += (stats.spd || 0) * qty;
            }
        }
        return { hp: totalHP, atk: totalATK, spd: totalSPD };
    },

    // 检查配方匹配
    checkRecipeMatch(playerSelection, recipeComposition) {
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
    },

    // 消耗材料
    consumeMaterials(composition) {
        for (const [itemName, requiredCount] of Object.entries(composition)) {
            player.backpack[itemName] -= requiredCount;
            if (player.backpack[itemName] <= 0) delete player.backpack[itemName];
        }
    }
};

// 敌人相关工具函数
const EnemyUtils = {
    // 从模板创建敌人
    createFromTemplate(template, wave, difficultyMultiplier) {
        const growthFactor = 1 + (Math.floor((wave - 1) / 10) * 0.1);
        const enemy = { ...template };
        
        enemy.maxHp = Math.round((template.hpPerBar || 100) * growthFactor * difficultyMultiplier);
        enemy.hp = enemy.maxHp;
        enemy.barsRemaining = template.bars || 1;
        enemy.totalBars = template.bars || 1;
        enemy.attackMin = Math.round((template.attackMin || 5) * growthFactor * difficultyMultiplier);
        enemy.attackMax = Math.round((template.attackMax || 10) * growthFactor * difficultyMultiplier);
        enemy.evasion = template.evasion || 0;
        
        return enemy;
    },

    // 减少敌人血条
    reduceBar() {
        if (!currentEnemy) return false;
        
        currentEnemy.barsRemaining--;
        if (currentEnemy.barsRemaining > 0) {
            currentEnemy.hp = currentEnemy.maxHp;
            return true; // 击破了一条血条
        } else {
            currentEnemy.hp = 0;
            return false; // 敌人彻底死亡
        }
    },

    // 应用词条
    applyAffixes(enemy, affixCount, difficulty) {
        enemy.affixes = [];
        if (affixCount <= 0) return;

        const affixKeys = Object.keys(enemyAffixes);
        const shuffledKeys = [...affixKeys].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < affixCount && i < shuffledKeys.length; i++) {
            const key = shuffledKeys[i];
            const newAffix = { ...enemyAffixes[key] };
            enemy.affixes.push(newAffix);
            if (newAffix.applyStats) {
                newAffix.applyStats(enemy);
            }
        }
    },

    // 计算应获得的词条数量
    calculateAffixCount(wave, isBoss, difficulty) {
        let count = 0;
        if (isBoss) {
            count = 4;
        } else if (wave >= 200) {
            count = 3;
        } else if (wave >= 100) {
            count = 2;
        } else if (wave >= 80) {
            count = Math.random() < 0.5 ? 1 : 2;
        } else if (wave >= 20) {
            count = 1;
        }

        if (difficulty === 'easy') {
            count = Math.min(count, 1);
        } else if (difficulty === 'normal') {
            count = Math.min(count, 2);
        }

        return count;
    }
};

// 伤害计算工具函数
const DamageUtils = {
    // 计算最终伤害（考虑所有加成）
    calculateFinalDamage(baseDamage, isCrit = false, critDamage = 2.0) {
        let damage = baseDamage;
        if (isCrit) damage *= critDamage;
        
        if (player.executeDamageBonus > 0 && (currentEnemy.hp / currentEnemy.maxHp <= 0.3)) {
            damage *= (1 + player.executeDamageBonus);
        }
        
        if (player.tempDamageMultiplier > 1.0) {
            damage *= player.tempDamageMultiplier;
        }
        
        if (player.damagePenaltyPercent > 0) {
            damage *= (1 - player.damagePenaltyPercent);
        }
        
        return Math.round(damage);
    },

    // 应用敌人减伤
    applyEnemyDamageReduction(damage) {
        if (!currentEnemy.affixes) return damage;
        
        let finalDamage = damage;
        currentEnemy.affixes.forEach(affix => {
            if (affix.applyIncomingDamage) {
                finalDamage = affix.applyIncomingDamage(finalDamage);
            }
        });
        return finalDamage;
    },

    // 处理伤害溢出（血条击破）
    handleDamageOverflow(damage, currentHp, maxHp, remainingBars) {
        if (damage < currentHp) return { finalDamage: damage, barsBroken: 0, remainingHp: currentHp - damage };
        
        let remainingDamage = damage - currentHp;
        let barsBroken = 1;
        let finalHp = 0;
        
        while (remainingDamage > 0 && remainingBars > barsBroken) {
            barsBroken++;
            remainingDamage *= 0.75; // 25% 伤害衰减
            remainingDamage = Math.round(remainingDamage);
            
            if (remainingDamage >= maxHp) {
                remainingDamage -= maxHp;
            } else {
                finalHp = maxHp - remainingDamage;
                remainingDamage = 0;
            }
        }
        
        return {
            finalDamage: damage,
            barsBroken,
            remainingHp: finalHp || 0
        };
    }
};

// 任务工具函数
const QuestUtils = {
    // 检查任务进度
    checkQuestProgress(enemyName, inOneTurn = false) {
        const allQuests = [...activeNormalQuests, ...activeTransferQuests];
        allQuests.forEach(quest => {
            if (quest.completed) return;
            
            if (quest.type === 'kill' || quest.type === 'custom') {
                if (quest.isTransferQuest) {
                    this.checkTransferQuestProgress(quest, enemyName, inOneTurn);
                } else if (quest.targetEnemy === enemyName || 
                          (Array.isArray(quest.targetEnemy) && quest.targetEnemy.includes(enemyName))) {
                    quest.currentProgress++;
                }
            }
        });
    },

    // 检查转职任务进度
    checkTransferQuestProgress(quest, enemyName, inOneTurn) {
        switch (quest.id) {
            case "assassinTransfer":
                if (enemyName === "精英方塊" && inOneTurn) quest.currentProgress++;
                break;
            case "swordsmanTransfer":
                if (enemyName === "魔王方塊") quest.currentProgress = turnsAgainstBoss <= 5 ? 1 : 0;
                break;
            case "shieldmanTransfer":
                quest.currentProgress = player.totalReflectedDamage;
                break;
            case "variantTransfer":
                if (player.questTracking?.conditionMet) quest.currentProgress = 1;
                break;
        }
    },

    // 完成任务
    completeQuest(quest) {
        quest.completed = true;
        
        currentMoney += Math.round(quest.moneyReward * gameDifficulty.moneyMultiplier * (1 + (player.moneyBonusPercent || 0)));
        gainXP(quest.xpReward);

        if (quest.isTransferQuest) {
            this.handleTransferQuestCompletion(quest);
            activeTransferQuests = activeTransferQuests.filter(q => q.id !== quest.id);
        } else {
            gameMessage.textContent = `任務「${quest.name}」完成！獲得 ${Math.round(quest.moneyReward * gameDifficulty.moneyMultiplier)} 金錢和 ${quest.xpReward} 經驗值！`;
            activeNormalQuests = activeNormalQuests.filter(q => q.id !== quest.id);
        }

        updateAllDisplays();
        setTimeout(() => generateMultipleQuests(false), 2000);
    },

    // 处理转职任务完成
    handleTransferQuestCompletion(quest) {
        let message = `任務完成！轉職成功！你成為了「${quest.transferToProfession}」！`;
        
        // 执行转职
        player.profession = quest.transferToProfession;
        player.transferTier = (player.transferTier || 0) + 1;
        
        // 应用转职特殊效果
        switch (quest.id) {
            case "assassinTransfer":
                player.critChance = 0;
                player.critDamage = 1.0;
                playerCritChanceDisplay.style.display = 'none';
                playerCritDamageDisplay.style.display = 'none';
                currentItemCosts.heal.cost = 99999;
                currentItemCosts.heal.description = "刺客無法回血";
                break;
            case "swordsmanTransfer":
                player.bleedChance += 50;
                message += ` 流血機率+50%！`;
                break;
            case "shieldmanTransfer":
                player.reflectDamage += 60;
                player.maxHp += 1000;
                player.hp += 1000;
                message += ` 反傷+60%，血量上限+1000！`;
                break;
            case "variantTransfer":
                learnAbility("攻擊姿態");
                message += ` 你也領悟了新的姿態：攻擊姿態！`;
                break;
            case "shortlivedTransfer":
                learnAbility("高速移動");
                message += ` 你的身法已達極致，領悟了新招式：高速移動！`;
                break;
            case "phantomBladeTransfer":
                learnAbility("幻劍");
                message += ` 你掌握了劍之幻影，領悟了新招式：幻劍！`;
                break;
            case "phantomShieldTransfer":
                learnAbility("盾反");
                message += ` 你洞悉了攻防的間隙，領悟了新招式：盾反！`;
                break;
            case "tyrantSwordTransfer":
                player.piercingSpillover = true;
                message += ` 你獲得了「攻擊貫穿」能力！`;
                break;
            case "tyrantShieldTransfer":
                player.reflectSpillover = true;
                message += ` 你獲得了「反傷貫穿」能力！`;
                break;
        }
        
        gameMessage.textContent = message;
        updateShopItemsForProfession();
    }
};

// 试炼工具函数
const TrialUtils = {
    // 启动短命试炼计时器
    startShortLivedTimer(resetTime = true) {
        this.stopShortLivedTimer();
        
        const timerDisplay = document.getElementById('shortLivedTrialTimerDisplay');
        const timerElement = document.getElementById('shortLivedTrialTime');
        if (!timerDisplay || !timerElement) return;

        timerDisplay.style.display = 'block';
        if (resetTime) {
            shortLivedTrialTimeRemaining = 60;
        }
        timerElement.textContent = shortLivedTrialTimeRemaining;

        shortLivedTrialTimer = setInterval(() => {
            shortLivedTrialTimeRemaining--;
            timerElement.textContent = shortLivedTrialTimeRemaining;

            if (shortLivedTrialTimeRemaining <= 0) {
                player.bars--;
                gameMessage.textContent = "時間到！你失去了一條血條！";
                if (player.bars <= 0) {
                    endGame('你的血條已耗盡，挑戰失敗...');
                } else {
                    this.startShortLivedTimer();
                }
                updateDisplay();
            }
        }, 1000);
    },

    // 停止短命试炼计时器
    stopShortLivedTimer() {
        clearInterval(shortLivedTrialTimer);
        shortLivedTrialTimer = null;
        const timerDisplay = document.getElementById('shortLivedTrialTimerDisplay');
        if (timerDisplay) {
            timerDisplay.style.display = 'none';
        }
    },

    // 处理混乱试炼的属性打乱
    applyChaosTrial() {
        const values = [player.maxHp, player.attackMax, player.speed];
        for (let i = values.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [values[i], values[j]] = [values[j], values[i]];
        }
        player.maxHp = Math.max(1, Math.round(values[0]));
        player.attackMax = Math.max(1, Math.round(values[1]));
        player.speed = Math.max(0, parseFloat(values[2].toFixed(1)));
        player.hp = player.maxHp;
        gameMessage.textContent = '混亂降臨！你的屬性已被重塑！';
    }
};

// 显示工具函数
const DisplayUtils = {
    // 显示浮动文字
    showFloatingText(text, targetElement, type = 'damage') {
        const textElement = document.createElement('span');
        textElement.textContent = text;
        textElement.className = `floating-text ${type}`;
        
        const rect = targetElement.getBoundingClientRect();
        const containerRect = battleArea.getBoundingClientRect();

        textElement.style.left = `${rect.left - containerRect.left + rect.width / 2 - 20}px`;
        textElement.style.top = `${rect.top - containerRect.top - 20}px`;
        
        battleArea.appendChild(textElement);
        
        setTimeout(() => {
            textElement.remove();
        }, 1450);
    },

    // 击中动画
    hitAnimation(charElement) {
        charElement.classList.add('hit');
        setTimeout(() => charElement.classList.remove('hit'), 100);
    },

    // 更新所有显示（限流）
    updateAll() {
        if (window.updateDisplayQueue) {
            updateDisplayQueue.schedule(() => {
                updateShopItemsForProfession();
                updateDisplay();
                updateQuestDisplay();
                renderTalentTree();
                if (tabSynthesis.classList.contains('active')) renderSynthesisRecipes();
            });
        } else {
            // 备用方案
            updateShopItemsForProfession();
            updateDisplay();
            updateQuestDisplay();
            renderTalentTree();
            if (tabSynthesis.classList.contains('active')) renderSynthesisRecipes();
        }
    }
};