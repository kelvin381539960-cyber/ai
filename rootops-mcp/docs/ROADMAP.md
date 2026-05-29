# Roadmap

## Current policy mode

- [x] maximum-permission internal test mode
- [x] audit logging retained
- [x] emergency freeze retained
- [x] approval.bypass blocked

## Phase 7: Hardening

- [x] systemd service template for remote agent
- [x] remote agent client tools
- [x] install/test CI scripts
- [x] typed integration tests
- [x] service uninstall/rotate-token tools
- [x] wire lifecycle helper directly into the main MCP server switch

## Next

- [ ] run real acceptance tests on target server
- [ ] fix TypeScript/runtime errors from maximum-permission test mode
- [ ] add purge-install-dir option for uninstall
- [ ] add remote agent token vaulting
- [ ] add typed end-to-end tests against a disposable SSH container
