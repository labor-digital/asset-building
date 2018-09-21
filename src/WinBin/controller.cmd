@echo off
node --inspect --max-old-space-size=4095 "%cd%\node_modules\@labor\asset-building\src\Controller.js" %*
exit