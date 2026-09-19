# guestwifi

OpenWrt packages for a deterministic guest Wi-Fi password generator with a QR
code page and LuCI configuration.

Each day a new password is derived from a configured shared secret and the
current date, written to the guest AP's WPA key, and published on a small web
page with a QR code for scanning by guests.

## Packages

| Package              | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `guestwifi`          | Password generator, QR page, WPA key sync, init script |
| `luci-app-guestwifi` | LuCI configuration page                              |

## Requirements

* OpenWrt 25.12 or later (apk package manager)
* Target: `ath79` (any target — both packages are `noarch`)
* Runtime deps resolved from the official OpenWrt repository: `openssl-util`,
  `qrencode`, `luci-base`, `luci-mod-rpc`

## How it works

* `guestwifi.main.secret` is combined with the current UTC date and turned into
  a password like `Sea2-Prairie2-Seal9-Hawk5` (four capitalized words + digits,
  derived via HMAC so it is deterministic and changes only daily).
* `/usr/bin/guest-password` regenerates on service start, and a self-managed
  cron entry runs it each night at 00:05.
* If `guestwifi.main.interface` is set, the key is written to that `wifi-iface`
  section. Otherwise the script auto-detects an AP interface whose SSID matches
  `guestwifi.main.ssid`. Wireless config is committed and `wifi reload` run.
* The public page at `http://<router>/guestwifi/` shows the current SSID,
  password and expiry date, plus an SVG QR code. The generated password is only
  public on the page that is meant to be shared with guests.
* A custom word list can be supplied (`words` option) — exactly 256 unique
  lowercase words of 3-12 characters, one per line. Invalid lists fall back to
  the built-in list with a warning.

## Configuration

`/etc/config/guestwifi`:

```ini
config guestwifi 'main'
	option enabled  '1'
	option ssid     'Guest'       # wireless SSID / QR network name
	option secret   ''            # shared secret (required, set it!)
	option interface ''           # wifi-iface section name; empty = match by SSID
	option words    ''            # optional custom word list (multiline)
```

Regeneration runs on boot, on the nightly cron, and when LuCI saves.
There is no automatic trigger on a bare `uci commit` (stock OpenWrt has no
config-change hook for services), so after editing via CLI run:

```sh
uci commit guestwifi && service guestwifi restart
```

## Build

Build with the official OpenWrt SDK container — no local SDK required:

```sh
make build          # outputs .dkr-out/bin/packages/mips_24kc/base/*.apk
```

Or directly:

```sh
docker run --rm \
  -v "$(pwd)"/.dkr-out/bin:/builder/bin \
  -v "$(pwd)"/.dkr-out/dl:/builder/dl \
  -v "$(pwd)"/package:/pkg:ro \
  openwrt/sdk:ath79-generic-v25.12.5 \
  sh -c 'cd /builder && ./scripts/feeds update -a &&
         ln -sfn /pkg/guestwifi package/guestwifi &&
         ln -sfn /pkg/luci-app-guestwifi package/luci-app-guestwifi &&
         make defconfig &&
         make package/guestwifi/compile package/luci-app-guestwifi/compile -j$(nproc)'
```

Fed from GitHub Actions automatically: push to `main` builds both packages and
publishes them to GitHub Pages as an apk repository (see
`.github/workflows/build.yml`).

## Install on the router

Point apk at the published Pages repository:

```sh
echo "https://plmeister.github.io/guestwifi/mips_24kc/base" \
  > /etc/apk/repositories.d/guestwifi.list
apk update
apk add --allow-untrusted guestwifi luci-app-guestwifi
uci set guestwifi.main.secret='your-secret'
uci commit guestwifi
/etc/init.d/guestwifi start
```

The `--allow-untrusted` flag is required because the Pages repository is not
signed. For signed installs, re-sign `index.json`/`packages.adb` with your own
key and copy the `.pub` into `/etc/apk/keys/`.

## License

MIT — see [LICENSE](LICENSE).