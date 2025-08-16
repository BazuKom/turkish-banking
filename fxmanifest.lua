fx_version 'cerulean'
game 'gta5'

author 'BazuFix'
description 'Turkish Banking'
version '1.0.0'

ui_page 'ui/ui.html'

files {
    'ui/ui.html',
    'ui/ui.js',
    'ui/ui.css'
}

depencidy 'oxmysql'

shared_script 'config.lua'
client_script 'client/client.lua'
server_script '@oxmysql/lib/MySQL.lua'
server_script 'server/server.lua'
