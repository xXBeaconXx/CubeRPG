function generateMultipleQuests(fromLevelUp = false) {
    activeNormalQuests = activeNormalQuests.filter(q => !q.completed);
    activeTransferQuests = activeTransferQuests.filter(q => !q.completed);
    const allActiveQuestIds = [...activeNormalQuests, ...activeTransferQuests].map(q => q.id);
    const maxNormalQuests = 3;
    if (activeNormalQuests.length < maxNormalQuests) {
        const availableTemplates = questTemplates.filter(template =>
            !template.isTransferQuest &&
            !allActiveQuestIds.includes(template.id) &&
            player.level >= template.requiredLevel
        );
        const newQuestCount = maxNormalQuests - activeNormalQuests.length;
        for (let i = 0; i < newQuestCount && availableTemplates.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableTemplates.length);
            const newQuestTemplate = availableTemplates.splice(randomIndex, 1)[0];
            const newQuest = { ...newQuestTemplate, currentProgress: 0, completed: false };
            activeNormalQuests.push(newQuest);
            if (fromLevelUp) {
                gameMessage.textContent = `新任務：${newQuest.name}！`;
            }}}
    const availableTransferTemplates = questTemplates.filter(template =>
        template.isTransferQuest &&
        !allActiveQuestIds.includes(template.id) &&
        player.level >= template.requiredLevel &&
        template.specificProfession === player.profession &&
        (template.requiredTier || 0) === (player.transferTier || 0)
    );
    availableTransferTemplates.forEach(template => {
        const newQuest = { ...template, currentProgress: 0, completed: false };
        activeTransferQuests.push(newQuest);
        gameMessage.textContent = `出現新的轉職任務：${newQuest.name}！`;
    });updateQuestDisplay();}
function refreshNormalQuests() {
    const refreshCost = 300;
    if (currentMoney < refreshCost) {
        gameMessage.textContent = '金錢不足，無法刷新任務！';
        return;}
    if (activeNormalQuests.length === 0) {
        gameMessage.textContent = '沒有可刷新的任務。';
        return;}
    currentMoney -= refreshCost;
    player.totalMoneySpent += refreshCost;
    activeNormalQuests = [];
    generateMultipleQuests();
    gameMessage.textContent = '普通任務已刷新！';
    updateDisplay();}
function renderQuestList(questArray, element) {
    element.innerHTML = '';
    if (questArray.length === 0) {
        element.innerHTML = `<p>${element.id.includes('normal') ? '目前沒有任務。' : '沒有可用的轉職任務。'}</p>`;
        return;}
    questArray.forEach(quest => {
        const questDiv = document.createElement('div');
        questDiv.classList.add('quest-item');
        if (quest.isTransferQuest) questDiv.classList.add('transfer-quest');
        let progressHTML;
        const questType = quest.type || 'kill';
        if (questType === 'submit') {
            progressHTML = '<ul style="margin: 5px 0; padding-left: 20px; font-size: 0.85em;">';
            let canSubmit = true;
            for (const [item, required] of Object.entries(quest.submissionItems)) {
                const owned = player.backpack[item] || 0;
                progressHTML += `<li>${item}: ${owned} / ${required}</li>`;
                if (owned < required) canSubmit = false;}
            progressHTML += '</ul>';
            const submitButton = document.createElement('button');
            submitButton.textContent = '提交';
            submitButton.className = 'submit-quest-btn'; // Apply new class
            submitButton.disabled = !canSubmit;
            submitButton.onclick = () => submitQuestItems(quest.id);
            questDiv.innerHTML = `<h3>${quest.name}</h3><div class="quest-progress">${progressHTML}</div><p class="quest-rewards">獎勵: ${quest.moneyReward} 金錢, ${quest.xpReward} 經驗值</p>`;
            questDiv.appendChild(submitButton);
        } else {
            progressHTML = `<p class="quest-progress">進度: ${quest.currentProgress}/${quest.targetCount}</p>`;
            let specialConditionHTML = quest.specialCondition ? `<p class="quest-special-condition">特殊條件: ${quest.specialCondition}</p>` : '';
            if (quest.isTransferQuest) specialConditionHTML += `<p class="quest-special-condition">所需等級: ${quest.requiredLevel}</p>`;
            questDiv.innerHTML = `<h3>${quest.name}</h3>${progressHTML}<p class="quest-rewards">獎勵: ${quest.moneyReward} 金錢, ${quest.xpReward} 經驗值</p>${specialConditionHTML}`;
        }element.appendChild(questDiv);});}
function updateQuestDisplay() {
    renderQuestList(activeNormalQuests, normalQuestListElement);
    renderQuestList(activeTransferQuests, transferQuestListElement);
    document.getElementById('refreshQuestsBtn').disabled = currentMoney < 300;
}
function checkAllQuestProgress(enemyName, inOneTurn = false) {
    // 直接使用 QuestUtils 检查进度
    QuestUtils.checkQuestProgress(enemyName, inOneTurn);
    processCompletedQuests();
    updateQuestDisplay();
}
function processCompletedQuests() {
    const allQuests = [...activeNormalQuests, ...activeTransferQuests];
    const newlyCompletedQuests = allQuests.filter(q => !q.completed && q.currentProgress >= q.targetCount);
    if (newlyCompletedQuests.length > 0) {
        newlyCompletedQuests.forEach(quest => { completeQuest(quest); });
    }}
function submitQuestItems(questId) {
    const allQuests = [...activeNormalQuests, ...activeTransferQuests];
    const quest = allQuests.find(q => q.id === questId);
    if (!quest) return;
    for (const [item, required] of Object.entries(quest.submissionItems)) {
        if ((player.backpack[item] || 0) < required) {
            gameMessage.textContent = "物品不足，無法提交！";
            updateQuestDisplay();
            return;
        }}
    for (const [item, required] of Object.entries(quest.submissionItems)) {
        player.backpack[item] -= required;
        if (player.backpack[item] <= 0) {
            delete player.backpack[item];
        }}completeQuest(quest);}
function completeQuest(quest) {
    QuestUtils.completeQuest(quest);
}

function performTransfer(newProfession, attackBoost, speedBoost, bleedChanceBoost = 0, reflectBoost = 0, maxHPBoost = 0, enablePiercingSpillover = false, enableReflectSpillover = false) {
    player.profession = newProfession;
    player.attackMin += attackBoost || 0;
    player.attackMax += attackBoost || 0;
    player.speed += speedBoost || 0;
    player.bleedChance += bleedChanceBoost || 0;
    player.reflectDamage += reflectBoost || 0;
    player.maxHp += maxHPBoost || 0;
    player.hp = player.maxHp;
    player.transferTier = (player.transferTier || 0) + 1;
    player.piercingSpillover = enablePiercingSpillover;
    player.reflectSpillover = enableReflectSpillover;

    if (newProfession === "刺客 | 改") {
        player.critChance = 0;
        player.critDamage = 1.0;
        playerCritChanceDisplay.style.display = 'none';
        playerCritDamageDisplay.style.display = 'none';
        currentItemCosts.heal.cost = 99999;
        currentItemCosts.heal.description = "刺客無法回血";
    }

    let message = ` 轉職成功！你成為了「${newProfession}」！`;
    if (attackBoost) message += ` 攻擊力+${attackBoost}，`;
    if (speedBoost) message += ` 速度+${speedBoost}，`;
    if (bleedChanceBoost) message += ` 流血機率+${bleedChanceBoost}%，`;
    if (reflectBoost) message += ` 反傷+${reflectBoost}%，`;
    if (maxHPBoost) message += ` 血量上限+${maxHPBoost}，`;
    if (enablePiercingSpillover) message += ` 你獲得了「攻擊貫穿」能力！`;
    if (enableReflectSpillover) message += ` 你獲得了「反傷貫穿」能力！`;

    if (message.endsWith('，')) {
        message = message.substring(0, message.length - 1);
    }
    message += '！';
    
    gameMessage.textContent = `任務完成！` + message;
    updateShopItemsForProfession();
    updateDisplay();
}