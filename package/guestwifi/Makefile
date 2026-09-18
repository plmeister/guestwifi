include $(TOPDIR)/rules.mk

PKG_NAME:=guestwifi
PKG_RELEASE:=1

PKG_LICENSE:=MIT
PKG_MAINTAINER:=Scott Lees

include $(INCLUDE_DIR)/package.mk

define Package/guestwifi
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=Deterministic guest Wi-Fi password generator
  DEPENDS:=+openssl-util +qrencode
  PKGARCH:=all
endef

define Package/guestwifi/description
  Generates deterministic guest Wi-Fi passwords and QR codes from
  a configured shared secret and date.
endef

define Build/Configure
endef

define Build/Compile
endef

define Build/Install
endef

define Package/guestwifi/install
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./files/etc/config/guestwifi $(1)/etc/config/guestwifi

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/etc/init.d/guestwifi $(1)/etc/init.d/guestwifi

	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) ./files/usr/bin/guest-password $(1)/usr/bin/guest-password
endef

$(eval $(call BuildPackage,guestwifi))
