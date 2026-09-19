DOCKER_IMAGE ?= openwrt/sdk:ath79-generic-v25.12.5
JOBS       ?= $(shell nproc 2>/dev/null || echo 4)
OUT         = .dkr-out/bin/packages/mips_24kc/base

.PHONY: build index clean

# Build both packages in the official OpenWrt SDK container.
build:
	mkdir -p .dkr-out/bin .dkr-out/dl
	docker run --rm --user 0 \
	  -v $(CURDIR)/.dkr-out/bin:/builder/bin \
	  -v $(CURDIR)/.dkr-out/dl:/builder/dl \
	  -v $(CURDIR)/package:/pkg:ro \
	  $(DOCKER_IMAGE) \
	  sh -c 'cd /builder && ./scripts/feeds update -a && \
	    openssl genrsa -out private-key.pem 2048 && \
	    ln -sfn /pkg/guestwifi package/guestwifi && \
	    ln -sfn /pkg/luci-app-guestwifi package/luci-app-guestwifi && \
	    make defconfig && \
	    make package/guestwifi/compile package/luci-app-guestwifi/compile -j$(JOBS) && \
	    make package/index'

# Regenerate the apk index for the built packages (after a manual build).
# The index is signed with an ephemeral key; use --allow-untrusted to install.
index:
	docker run --rm --user 0 \
	  -v $(CURDIR)/.dkr-out/bin:/builder/bin \
	  -v $(CURDIR)/.dkr-out/dl:/builder/dl \
	  -v $(CURDIR)/package:/pkg:ro \
	  $(DOCKER_IMAGE) \
	  sh -c 'cd /builder && openssl genrsa -out private-key.pem 2048 && make package/index'

clean:
	rm -rf .dkr-out