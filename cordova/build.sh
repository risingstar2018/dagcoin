#! /bin/bash
#
# Usage:
# sh ./build.sh --android --reload
#
#
Green='\033[0;32m'
Red='\033[0;31m'
CloseColor='\033[0m'
# Check function OK
checkOK() {
	if [ $? != 0 ]; then
		echo -e "${Red}* ERROR. Exiting...${CloseColor}"
		exit 1
	fi
}

# Configs
BUILDDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT="$BUILDDIR/project-$1"

CURRENT_OS=$1
UNIVERSAL_LINK_HOST=false
APPLICATION_NAME=Dagcoin

if [ -z "CURRENT_OS" ]
then
 echo "Build.sh WP8|ANDROID|IOS"
fi

CLEAR=false
DBGJS=false

if [[ $2 == "--clear" || $3 == "--clear" ]]
then
	CLEAR=true
fi

if [[ $2 == "--dbgjs" || $3 == "--dbgjs" ]]
then
	DBGJS=true
fi

if $DBGJS
then
  UNIVERSAL_LINK_HOST=$(node -p -e "require('$BUILDDIR/../environments/testnet.json').ENV.universalLinkHost")
  APPLICATION_NAME=$(node -p -e "require('$BUILDDIR/../environments/testnet.json').ENV.applicationName")
  ANDROID_PACKAGE=org.dagcoin.client.tn
else
  UNIVERSAL_LINK_HOST=$(node -p -e "require('$BUILDDIR/../environments/live.json').ENV.universalLinkHost")
  APPLICATION_NAME=$(node -p -e "require('$BUILDDIR/../environments/live.json').ENV.applicationName")
  ANDROID_PACKAGE=org.dagcoin.client
fi
echo -e "${Green}OK UNIVERSAL_LINK_HOST is set to ${UNIVERSAL_LINK_HOST}${CloseColor}"
echo -e "${Green}OK APPLICATION_NAME is set to ${APPLICATION_NAME}${CloseColor}"
echo -e "${Green}OK ANDROID_PACKAGE is set to ${ANDROID_PACKAGE}${CloseColor}"

echo -e "${OpenColor}${Green}* Checking dependencies...${CloseColor}"
command -v cordova >/dev/null 2>&1 || { echo >&2 "Cordova is not present, please install it: sudo npm install -g cordova."; exit 1; }
#command -v xcodebuild >/dev/null 2>&1 || { echo >&2 "XCode is not present, install it or use [--android]."; exit 1; }

# Create project dir
if $CLEAR
then
	if [ -d $PROJECT ]; then
		rm -rf $PROJECT
	fi
fi

echo "Build directory is $BUILDDIR"
echo "Project directory is $PROJECT"


if [ ! -d $PROJECT ]; then
	cd $BUILDDIR
	echo -e "${OpenColor}${Green}* Creating project... ${CloseColor}"
	cordova create project-$1 ${ANDROID_PACKAGE} Dagcoin
	checkOK

	cd $PROJECT

	if [ $CURRENT_OS == "ANDROID" ]; then
		echo -e "${OpenColor}${Green}* Adding Android platform... ${CloseColor}"
		cordova platforms add android
		checkOK
	fi

	if [ $CURRENT_OS == "IOS" ]; then
		echo "${Green}* Adding IOS platform... ${CloseColor}"
		cordova platforms add ios
		checkOK
	fi

	if [ $CURRENT_OS == "WP8" ]; then
		echo "${Green}* Adding WP8 platform... ${CloseColor}"
		cordova platforms add wp8
		checkOK
	fi

	echo -e "${OpenColor}${Green}* Installing plugins... ${CloseColor}"

#  cordova plugin add https://github.com/florentvaldelievre/virtualartifacts-webIntent.git
#  checkOK

	if [ $CURRENT_OS == "IOS" ]; then
		cordova plugin add https://github.com/phonegap/phonegap-plugin-barcodescanner.git
	else
		phonegap plugin add phonegap-plugin-barcodescanner
		checkOK
	fi
	checkOK

	cordova plugin add cordova-plugin-splashscreen@5.0.2
	checkOK

	cordova plugin add cordova-plugin-statusbar
	checkOK

	cordova plugin add cordova-plugin-customurlscheme --variable URL_SCHEME=$2
	checkOK

	cordova plugin add cordova-plugin-inappbrowser
	checkOK

	cordova plugin add cordova-plugin-x-toast && cordova prepare
	checkOK

	phonegap local plugin add https://github.com/ibnclaudius/CordovaClipboard
	checkOK

	cordova plugin add https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin.git && cordova prepare
	checkOK

	cordova plugin add cordova-plugin-spinner-dialog
	checkOK

	cordova plugin add cordova-plugin-dialogs
	checkOK

	cordova plugin add cordova-plugin-network-information
	checkOK

	cordova plugin add cordova-plugin-console
	checkOK

 	cordova plugin add cordova-plugin-uniquedeviceid
 	checkOK

	cordova plugin add cordova-plugin-file
	checkOK

	cordova plugin add cordova-plugin-touch-id && cordova prepare
	checkOK

	cordova plugin add cordova-plugin-android-fingerprint-auth
	checkOK

	cordova plugin add cordova-plugin-transport-security
	checkOK

	cordova plugin add cordova-ios-requires-fullscreen
	checkOK

	cordova plugin add cordova-sqlite-plugin
	checkOK

	cordova plugin add cordova-plugin-device-name
	checkOK

	if [ $CURRENT_OS == "ANDROID" ]; then
	  cordova plugin add phonegap-plugin-push@2.1.3
	  checkOK
	fi

	cordova plugin add cordova-universal-links-plugin
	checkOK

fi

if $DBGJS
then
	echo -e "${Green}* Generating bundle (debug js)...${CloseColor}"
	cd $BUILDDIR/..
	grunt cordova:$4
	checkOK
else
	echo -e "${Green}* Generating bundle...${CloseColor}"
	cd $BUILDDIR/..
	#grunt cordova-prod byteball core has some error, so uglify doesn't work.
	grunt cordova:$4
	checkOK
fi

echo -e "${OpenColor}${Green}* Copying files...${CloseColor}"
cd $BUILDDIR/..
cp -af public/** $PROJECT/www
checkOK

echo -e "${OpenColor}${Green}* Copying initial database...${CloseColor}"
cp node_modules/core/initial.byteball.sqlite $PROJECT/www
cp node_modules/core/initial.byteball-light.sqlite $PROJECT/www
checkOK

sed "s/<\!-- PLACEHOLDER: CORDOVA SRIPT -->/<script type='text\/javascript' charset='utf-8' src='cordova.js'><\/script>/g" public/index.html > $PROJECT/www/index.html
checkOK

cd $BUILDDIR

echo -e "${Green}* Changing confix.xml...${CloseColor}"
cp config.xml $PROJECT/config.xml
sed "s/@UNIVERSAL_LINK_HOST/${UNIVERSAL_LINK_HOST}/g;s/@APPLICATION_NAME/${APPLICATION_NAME}/g;s/@ANDROID_PACKAGE/${ANDROID_PACKAGE}/g" < config.xml > $PROJECT/config.xml
checkOK

if [ $CURRENT_OS == "ANDROID" ]; then
	echo -e "Android project!!!"

	cat $BUILDDIR/android/android.css >> $PROJECT/www/css/dagcoin.css

	mkdir -p $PROJECT/platforms/android/res/xml/
	checkOK

  # gcm needs google-services.json. google-services.json is downloaded from firebase web site.
  if $DBGJS
  then
    cp android/testnet/google-services.json $PROJECT/platforms/android/google-services.json
    checkOK
  else
    cp android/live/google-services.json $PROJECT/platforms/android/google-services.json
    checkOK
  fi

  # new cordova-android needs colors.xml
	cp android/colors.xml $PROJECT/platforms/android/res/values
	checkOK


#  cp android/AndroidManifest.xml $PROJECT/platforms/android/AndroidManifest.xml
#  checkOK

	cp android/build-extras.gradle $PROJECT/platforms/android/build-extras.gradle
	checkOK

  if $DBGJS
  then
  	cp android/testnet/project.properties $PROJECT/platforms/android/project.properties
  	checkOK
  else
  	cp android/live/project.properties $PROJECT/platforms/android/project.properties
  	checkOK
  fi

	cp -R android/res/* $PROJECT/platforms/android/res
	checkOK
fi

if [ $CURRENT_OS == "IOS" ]; then

	echo "IOS project!!!"

	cp -R ios $PROJECT/../
	checkOK
#  mkdir -p $PROJECT/platforms/ios
#  checkOK
#
#  cp ios/Byteball-Info.plist $PROJECT/platforms/ios/Byteball-Info.plist
#  checkOK
#
#  mkdir -p $PROJECT/platforms/ios/Byteball/Resources/icons
#  checkOK
#
#  mkdir -p $PROJECT/platforms/ios/Byteball/Resources/splash
#  checkOK
#
#  cp -R ios/icons/* $PROJECT/platforms/ios/Byteball/Resources/icons
#  checkOK
#
#  cp -R ios/splash/* $PROJECT/platforms/ios/Byteball/Resources/splash
#  checkOK
fi
