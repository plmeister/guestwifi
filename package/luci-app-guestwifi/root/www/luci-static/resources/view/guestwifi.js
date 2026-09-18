"use strict";
"require view";
"require form";
"require uci";
"require fs";

return view.extend({
  load: function () {
    return Promise.all([uci.load("guestwifi"), uci.load("wireless")]);
  },

  render: function () {
    var m, s, o;

    m = new form.Map(
      "guestwifi",
      _("Guest Wi-Fi"),
      _(
        "Configure the guest Wi-Fi network and deterministic password generator.",
      ),
    );

    s = m.section(form.NamedSection, "main", "guestwifi", _("Configuration"));

    s.anonymous = true;

    o = s.option(
      form.Flag,
      "enabled",
      _("Enabled"),
      _("Generate the guest Wi-Fi password and QR code automatically."),
    );

    o.default = "1";
    o.rmempty = false;

    o = s.option(
      form.Value,
      "ssid",
      _("Guest Wi-Fi SSID"),
      _("The wireless network name encoded into the QR code."),
    );

    o.rmempty = false;
    o.placeholder = "Guest";

    var seen = {};
    (uci.sections("wireless", "wifi-iface") || []).forEach(function (w) {
      if ((w.mode && w.mode !== "ap") || !w.ssid || seen[w.ssid]) {
        return;
      }
      seen[w.ssid] = true;
      o.value(w.ssid, w.ssid);
    });

    o = s.option(
      form.Value,
      "interface",
      _("Wi-Fi interface"),
      _(
        "Optional section name of the target wireless interface " +
          "(e.g. cfg01234). Leave empty to auto-detect by SSID.",
      ),
    );

    o.rmempty = true;
    o.placeholder = "auto";

    (uci.sections("wireless", "wifi-iface") || []).forEach(function (w) {
      if (!w.ssid) {
        return;
      }
      o.value(w[".name"], w[".name"] + " (" + w.ssid + ")");
    });

    o = s.option(
      form.Value,
      "secret",
      _("Shared secret"),
      _("The secret used to deterministically generate the guest password."),
    );

    o.password = true;
    o.rmempty = false;

    o = s.option(
      form.TextValue,
      "words",
      _("Custom word list"),
      _(
        "Optional. 256 unique lowercase words (3-12 letters), one per line, " +
          "used instead of the built-in list. Invalid lists fall back to built-in.",
      ),
    );

    o.rows = 12;
    o.wrap = "off";

    return m.render();
  },

  handleSaveApply: function (ev, mode) {
    var self = this;
    return this.super("handleSaveApply", [ev, mode]).then(function () {
      return fs.exec("/etc/init.d/guestwifi", ["restart"]);
    });
  },
});
