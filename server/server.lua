local QBCore = exports['qb-core']:GetCoreObject()

RegisterServerEvent("turkish-banking:server:SaveHistory")
AddEventHandler("turkish-banking:server:SaveHistory", function(data)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end

    exports.oxmysql:insert('INSERT INTO bank_transactions (citizenid, type, amount, color) VALUES (?, ?, ?, ?)', {
        Player.PlayerData.citizenid,
        data.type,
        data.amount,
        data.color
    }, function()
        TriggerClientEvent("turkish-banking:client:loadHistory", src)
    end)
end)
RegisterServerEvent("turkish-banking:server:Deposit")
AddEventHandler("turkish-banking:server:Deposit", function(amount)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end

    amount = tonumber(amount)
    if amount and amount > 0 and Player.Functions.RemoveMoney("cash", amount) then
        Player.Functions.AddMoney("bank", amount)
        TriggerClientEvent("turkish-banking:client:updateMoney", src, Player.PlayerData.money)
        TriggerClientEvent("turkish-banking:client:notifyResult", src, { success = true, type = "deposit", amount = amount, money = Player.PlayerData.money })
    else
        TriggerClientEvent("turkish-banking:client:notifyResult", src, { success = false, type = "deposit", amount = amount, money = Player.PlayerData.money })
    end
end)

RegisterServerEvent("turkish-banking:server:Withdraw")
AddEventHandler("turkish-banking:server:Withdraw", function(amount)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end

    amount = tonumber(amount)
    if amount and amount > 0 and Player.PlayerData.money["bank"] >= amount then
        Player.Functions.RemoveMoney("bank", amount)
        Player.Functions.AddMoney("cash", amount)
        TriggerClientEvent("turkish-banking:client:updateMoney", src, Player.PlayerData.money)
        TriggerClientEvent("turkish-banking:client:notifyResult", src, { success = true, type = "withdraw", amount = amount, money = Player.PlayerData.money })
    else
        TriggerClientEvent("turkish-banking:client:notifyResult", src, { success = false, type = "withdraw", amount = amount, money = Player.PlayerData.money })
    end
end)

RegisterServerEvent("turkish-banking:server:SendMoney")
AddEventHandler("turkish-banking:server:SendMoney", function(amount, receiverIban)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end

    amount = tonumber(amount)
    if not amount or amount <= 0 then
        TriggerClientEvent("turkish-banking:client:notifyResult", src, { success = false, type = "send", amount = amount, money = Player.PlayerData.money, message = "Geçersiz miktar" })
        return
    end

    local result = MySQL.single.await("SELECT citizenid FROM players WHERE JSON_EXTRACT(charinfo, '$.iban') = ?", { receiverIban })
    if not result then
        TriggerClientEvent("turkish-banking:client:notifyResult", src, { success = false, type = "send", amount = amount, money = Player.PlayerData.money, message = "Alıcı bulunamadı" })
        return
    end

    local Receiver = QBCore.Functions.GetPlayerByCitizenId(result.citizenid)
    if not Receiver then
        TriggerClientEvent("turkish-banking:client:notifyResult", src, { success = false, type = "send", amount = amount, money = Player.PlayerData.money, message = "Alıcı çevrimdışı" })
        return
    end

    if Player.Functions.RemoveMoney("bank", amount) then
        Receiver.Functions.AddMoney("bank", amount)
        TriggerClientEvent("turkish-banking:client:updateMoney", src, Player.PlayerData.money)
        TriggerClientEvent("turkish-banking:client:notifyResult", src, { success = true, type = "send", amount = amount, money = Player.PlayerData.money })
    else
        TriggerClientEvent("turkish-banking:client:notifyResult", src, { success = false, type = "send", amount = amount, money = Player.PlayerData.money, message = "Yetersiz bakiye" })
    end
end)

RegisterServerEvent("turkish-banking:server:RequestMoney")
AddEventHandler("turkish-banking:server:RequestMoney", function()
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if Player then
        TriggerClientEvent("turkish-banking:client:updateMoney", src, Player.PlayerData.money)
        TriggerClientEvent("turkish-banking:client:openBankUI", src)
    end
end)

RegisterServerEvent("turkish-banking:server:GetHistory")
AddEventHandler("turkish-banking:server:GetHistory", function()
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end

    exports.oxmysql:execute(
        'SELECT id, type, amount, color, DATE_FORMAT(date, "%Y-%m-%d %H:%i:%s") as date FROM bank_transactions WHERE citizenid = ? ORDER BY id DESC LIMIT 1000',
        { Player.PlayerData.citizenid },
        function(results)
            TriggerClientEvent("turkish-banking:client:SendHistory", src, results)
        end
    )
end)
