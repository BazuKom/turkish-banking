local QBCore = exports['qb-core']:GetCoreObject()

local isUIOpen = false

function openBankUI()
    if not isUIOpen then
        SetNuiFocus(true, true)
        TriggerServerEvent("turkish-banking:server:RequestMoney")
        TriggerServerEvent("turkish-banking:server:GetHistory")
        SendNUIMessage({ action = "openBankUI" })
        isUIOpen = true
    end
end

function closeBankUI()
    if isUIOpen then
        SetNuiFocus(false, false)
        SendNUIMessage({ action = "closeBankUI" })
        isUIOpen = false
    end
end

local showingText = false

function DrawText3D(x, y, z, text)
    local onScreen, _x, _y = World3dToScreen2d(x, y, z)
    if onScreen then
        SetTextScale(0.35, 0.35)
        SetTextFont(4)
        SetTextProportional(1)
        SetTextColour(255, 255, 255, 215)
        SetTextEntry("STRING")
        SetTextCentre(1)
        AddTextComponentString(text)
        DrawText(_x, _y)
    end
end

CreateThread(function()
    local waitTime = 1000
    while true do
        local playerPed = PlayerPedId()
        local playerCoords = GetEntityCoords(playerPed)
        local nearBank = false

        for _, bankCoords in pairs(Config.BankLocations) do
            local dist = #(playerCoords - bankCoords)

            if dist < 10.0 then
                nearBank = true
                if dist < 2.0 then
                    DrawText3D(bankCoords.x, bankCoords.y, bankCoords.z + 1.0, "[E] Banka")
                    if IsControlJustPressed(0, 38) then
                        openBankUI()
                        break
                    end
                end
            end
        end

        if nearBank then
            waitTime = 0
        else
            waitTime = 750
        end

        Wait(waitTime)
    end
end)


-- JS'ten kapatma talebi geldiğinde
RegisterNUICallback("close", function(_, cb)
    closeBankUI()
    cb("ok")
end)

RegisterNUICallback("deposit", function(data, cb)
    TriggerServerEvent("turkish-banking:server:Deposit", data.amount)
    cb({})
end)

RegisterNUICallback("withdraw", function(data, cb)
    TriggerServerEvent("turkish-banking:server:Withdraw", data.amount)
    cb({})
end)

RegisterNUICallback("send", function(data, cb)
    TriggerServerEvent("turkish-banking:server:SendMoney", data.amount, data.receiver)
    cb({})
end)

RegisterCommand("banktest", function()
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = "openBankUI",
        money = QBCore.Functions.GetPlayerData().money
    })
end)

RegisterNetEvent("turkish-banking:client:updateMoney", function(money)
    SendNUIMessage({
        action = "updateMoney",
        money = money
    })
end)

RegisterNetEvent("turkish-banking:client:notifyResult", function(data)
    local icon = data.success and "success" or "unsuccess"
    local message = ""
    local color = ""
    local tur = ""

    if data.type == "deposit" then
        message = data.success and "Para yatırma başarılı" or "Yatırma başarısız!"
        color = "green"
        tur = "Para Yatırma"
    elseif data.type == "withdraw" then
        message = data.success and "Para çekme başarılı" or "Çekme başarısız!"
        color = "red"
        tur = "Para Çekme"
    elseif data.type == "send" then
        message = data.success and "Para gönderme başarılı" or (data.message or "Gönderme başarısız!")
        color = "red"
        tur = "Para Gönderme"
    end

    SendNUIMessage({
        action = "showNotify",
        message = message,
        icon = icon
    })

    if data.success and (data.type == "deposit" or data.type == "withdraw" or data.type == "send") then
        SendNUIMessage({
            action = "addHistory",
            tur = tur,
            miktar = data.amount,
            color = color
        })

        TriggerServerEvent("turkish-banking:server:SaveHistory", {
            type = tur,
            amount = data.amount,
            color = color
        })
    end
end)

RegisterNetEvent("turkish-banking:client:SendHistory", function(history)
    SendNUIMessage({
        action = "loadHistory",
        history = history
    })
end)

RegisterNUICallback("loadHistory", function(_, cb)
    TriggerServerEvent("turkish-banking:server:GetHistory")
    cb("ok")
end)

RegisterNetEvent("turkish-banking:client:loadHistory", function(_, cb)
    TriggerServerEvent("turkish-banking:server:GetHistory")
end)

RegisterNUICallback("getPlayerName", function(data, cb)
    local player = QBCore.Functions.GetPlayerData()
    local firstname = player.charinfo.firstname
    local lastname = player.charinfo.lastname
    cb({
        name = firstname .. " " .. lastname
    })
end)
