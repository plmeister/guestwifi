include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-guestwifi
PKG_RELEASE:=1

PKG_LICENSE:=MIT
PKG_MAINTAINER:=Scott Lees

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-guestwifi
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=LuCI support for Guest Wi-Fi
  DEPENDS:=+guestwifi +luci-base
  PKGARCH:=all
endef

define Package/luci-app-guestwifi/description
  LuCI configuration interface for the guestwifi package.
endef

define Build/Configure
endef

define Build/Compile
endef

define Build/Install
endef

define Package/luci-app-guestwifi/install
	$(INSTALL_DIR) $(1)/usr/share/luci
	$(CP) ./root/usr/share/luci/* $(1)/usr/share/luci/
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/luci-app-guestwifi.json $(1)/usr/share/rpcd/acl.d/luci-app-guestwifi.json
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view
	$(INSTALL_DATA) ./root/www/luci-static/resources/view/guestwifi.js $(1)/www/luci-static/resources/view/guestwifi.js
endef

$(eval $(call BuildPackage,luci-app-guestwifi))
