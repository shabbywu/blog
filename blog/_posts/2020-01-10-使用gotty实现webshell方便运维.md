---
date: 2019-10-14
title: 使用 gotty 实现 webshell
sidebarDepth: 3
category: ops
tags:
-   ops
draft: true
---
```file
[Unit]
Description=gottyd
After=network.target

[Service]
Type=forking
ExecStart="/usr/local/bin/gotty-start.sh"
ExecReload=
ExecStop="/usr/local/bin/gotty-stop.sh"
PrivateTmp=true
Restart=1

[Install]
WantedBy=multi-user.target
```

```sh
#!/usr/bin/env bash
export HOME=/root
export GOPATH=$HOME/go
PATH=$PATH:$HOME/bin:/usr/local/go/bin:$GOPATH/bin
export PATH

export GOTTY_CREDENTIAL="shabbywu:im@shabby"
export GOTTY_PORT=9000
export GOTTY_PERMIT_WRITE=true
export GOTTY_RECONNECT=true

exec bash -c "gotty /bin/bash" &
```

```sh
#!/usr/bin/env bash
killall gotty
```