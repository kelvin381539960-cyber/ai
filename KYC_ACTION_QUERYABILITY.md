# KYC Action 可查询性核查表

用于管理 AIX KYC 全流程 action、前端动作、后端动作、可查询性、数据来源与口径风险。

## 可查询性枚举

| 标记 | 含义 |
|---|---|
| ✅ 可直接查 | 业务表或后端接口日志能明确查询 |
| ❌ 不能直接查 | 无确定 SQL 来源；只能看相邻后端接口或业务状态替代，不计入严格 action 漏斗 |
| 前端埋点仅代码可证 | AIX 前端代码可确认 PageEvent / sendEvent 发送到 Native Bridge，但当前无确定 SQL 表名/字段；不作为可直接查节点 |

## 重要口径说明

- `/aix/kyc/success` / `OpenWalletSubmitResult` 不是最终 KYC 通过，只能视为「提交结果页 / 已进入审核」。
- 最终 KYC 通过必须以 `aixpay_wallet.wallet_application.kyc_status = 5` 为准。
- POA 是条件分支，不能默认放进所有用户的主漏斗。
- 前端行为类 action 当前未找到确定 SQL 落表；不作为可直接查节点，优先使用后端接口日志或业务状态字段替代。
- 「前端动作」和「后端动作」只填写 AIX 代码能证明的事实；没有对应动作则留空。

## KYC Action 可查询性核查表

| 顺序 | Action Code | Action 含义 | 前端动作 | 后端动作 | 能否查 | 清晰数据来源 / 查询条件 |
|---:|---|---|---|---|---|---|
| 1 | `kyc_launch_enter` | 进入 KYC Launch loading | `KycNavigator.startFlow()` 执行 `router.push(RouterNames.KycLaunch)`，进入 `/aix/kyc/launch`。 | 无。仅进入前端 loading 页，未触发业务落库。 | ❌ 不能直接查 | 暂无确定 SQL 来源。业务库不落表；`PageNameMap` 未映射 KycLaunch。当前可落地近似入口是下一步 `kyc_start_api_called`，即 Doris 后端日志 `/api/wallet/kyc/start`。 |
| 2 | `kyc_start_api_called` | 调用 KYC start 接口 | `KycLaunchPage` mount 后调用 `store.startLoading()`；`useKycLaunchStore.startLoading()` 调 `kycService.start()`。 | `POST /api/wallet/kyc/start`；Controller 方法 `WalletApplicationController.startKyc()` 调 `walletService.startKyc()`。 | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/start`；日志关键词 `WalletController#startKyc`。 |
| 3 | `kyc_start_route_decided` | 后端返回下一步 route code | `useKycLaunchStore.handleStartResult()` 根据返回 code 调 `KycNavigator.navigateToNext()`。 | `WalletApplicationController.startKyc()` 返回 result；result code 可能是 `ROUTE_KYC_START_PAGE / ROUTE_PASSPORT_PAGE / ROUTE_POA_PAGE` 等。 | ✅ 可直接查 | Doris 后端日志：`WalletController#startKyc` result；解析 result code。 |
| 4 | `kyc_start_page_view` | 进入 KYC Start Page | `KycNavigator.navigateToNext()` 根据 `ROUTE_KYC_START_PAGE` replace 到 `RouterNames.KycStart`；页面组件为 `KycStartPage`。 | 无。页面曝光不触发后端接口。 | ❌ 不能直接查 | 无确定 SQL 来源。前端 PageEvent 发送到 Native Bridge，但当前没有确认事件表名/字段；业务库不记录页面曝光。后端 `ROUTE_KYC_START_PAGE` 只能说明后端决定跳 Start 页，不能证明页面已曝光。 |
| 5 | `kyc_country_select_open` | 点击国家输入框进入国家列表 | `KycStartPage` 中国家区域 `Pressable.onPress` 调 `handleCountrySelect()`，执行 `router.push(RouterNames.KycSupportedRegionSelect)`。 | 无。打开国家选择页不触发业务接口。 | ❌ 不能直接查 | 无确定 SQL 来源。代码未看到独立 click 埋点或业务落库。替代观察：后续国家列表接口请求只能说明列表被请求，不能证明点击打开。 |
| 6 | `kyc_region_list_loaded` | 国家列表加载成功 | `RegionSelectPage` mount 后 `useEffect` 调 `fetchRegions()`。 | `RegionSelectService.fetchRegions()` 经 `KycRepo.getCountryList()` 调 `GET /api/config/phone-area-list/kyc-start-page`。 | ✅ 可直接查接口日志 | 接口：`GET /api/config/phone-area-list/kyc-start-page`；不能代表用户选择，只代表国家列表请求。 |
| 7 | `kyc_region_click` | 点击选择国家 | `RegionSelectPage` 列表 item `onPress` 先 `sendEvent({ action: Action.RegionClick, extra: { region } })`，再 `selectRegion(item.region)`。 | 无。点击国家不触发后端接口，不直接落业务表。 | ❌ 不能直接查 | 无确定 SQL 来源。代码仅确认前端 `Action.RegionClick` 会发送到 Native Bridge，当前无事件表名/字段；业务库不记录点击。 |
| 8 | `kyc_region_selected_back_to_start` | 国家回填 Start 页 | `useRegionSelectStore.selectRegion()` 通过 `DeviceEventEmitter.emit("SelectSupportedRegionPage:result")` 回传国家，并 `router.back()`；`KycStartPage` 监听后 setSelectedCountry。 | 无。纯前端状态回填。 | ❌ 不能直接查 | 只是 `DeviceEventEmitter` 前端状态回传，无独立业务落库。 |
| 9 | `kyc_agreement_checkbox_click` | 点选协议 checkbox | `KycStartPage` 渲染 `Contract(location='KYC_START')`；Contract 组件内存在 checkbox UI 和 selected 状态。 | 无。点选 checkbox 不触发后端接口。 | ❌ 不能直接查 | Contract 组件有 checkbox UI，但未看到独立 `sendEvent` 或业务落库。 |
| 10 | `kyc_agreement_all_selected` | 协议全部勾选完成 | `Contract.onSelectedChanged` 回调 `handleContractChange()`；`useKycStartStore.setAgree()` 设置 `isAgreed` 和 `selectedContractIds`。 | 无。只是前端状态。 | ❌ 不能直接查 | 只是前端 `isAgreed` 状态，无业务落库。 |
| 11 | `kyc_start_continue_click` | Start 页点击 Continue | `KycStartPage` Continue 按钮 `onPress` 先 `sendEvent({ action: Action.NextClick, extra: { region } })`，再调用 `handleContinue()`；按钮条件是 `!isAgreed || !selectedCountry` 时 disabled。 | 点击本身无后端动作；后续 `handleContinue()` 可能发起 `submitStartPage`。 | ❌ 不能直接查 | 无确定 SQL 来源。代码有 `Action.NextClick`，但当前没有确认事件表名/字段；业务库不记录按钮点击。后续 `/api/wallet/kyc/start-page/submit` 只能说明提交成功，不证明点击事件本身。 |
| 12 | `kyc_start_page_submit_api` | 提交国家 + 协议确认 | `useKycStartStore.handleContinue()` 校验国家支持后调用 `kycService.submitStartPage({ countryCode })`。 | `POST /api/wallet/kyc/start-page/submit`；Controller `startKycPageSubmit()` 调 `walletService.startKycPageSubmit()`。 | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/start-page/submit`；日志关键词 `WalletController#startKycPageSubmit`。 |
| 13 | `kyc_agreement_saved` | KYC_START 协议落库 | 无独立前端动作；属于 Start 页 submit 的后端副作用。 | `WalletApplicationServiceImpl.startKycPageSubmit()` 调 `walletApplicationDomainService.saveKycStartAgreement(userId)`；domain 调 `userAgreementRemoteRepository.saveAgreement(userId, KYC_START)`。 | ✅ 可直接查 | `aixpay_app.user_agreement_consent`：`location = 'KYC_START'`，时间字段 `consented_at`。 |
| 14 | `wallet_application_created_or_loaded` | 创建或获取 KYC 主申请 | 无独立前端动作；属于 KYC start 或 Start submit 时后端处理。 | `walletApplicationDomainService.startKyc(userId)` 获取历史申请或创建新申请；创建逻辑 `walletApplicationRepository.save(new WalletApplication().init(userId))`。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：按 `user_id` 查记录；时间字段 `create_time`。 |
| 15 | `kyc_country_saved_to_wallet_application` | 国家写入 KYC 申请 | Start 页 Continue 后提交的 countryCode。 | `WalletApplicationServiceImpl.startKycPageSubmit()` 执行 `walletApplication.setNationality(request.getCountryCode())` 并 `walletApplicationRepository.update(walletApplication)`。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`nationality IS NOT NULL`；Start 页 submit 后写入。 |
| 16 | `route_to_passport_guide` | 后端返回 Passport Guide 路由 | `useKycStartStore.handleContinue()` 收到 `ROUTE_PASSPORT_PAGE` 后调用 `KycNavigator.navigateToNext()`。 | `WalletApplicationServiceImpl.startKycPageSubmit()` 返回 `ResponseBean._200(ResultCode.ROUTE_PASSPORT_PAGE)`。 | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/start-page/submit`；日志关键词 `WalletController#startKycPageSubmit`；result code = `ROUTE_PASSPORT_PAGE`。只证明后端返回路由，不证明 Passport 页面已曝光。 |
| 17 | `passport_guide_page_view` | 进入证件引导页 | `KycNavigator.navigateToNext()` 根据 `ROUTE_PASSPORT_PAGE` replace 到 `RouterNames.KycPassportGuide`；页面组件为 `KycPassportGuidePage`。 | 无。页面曝光不触发后端接口。 | ❌ 不能直接查 | 无确定 SQL 来源。前端 PageEvent 路由 `/aix/kyc/passport-guide`、PageName = `TakeIdPhoto` 未确认事件落表；业务库不记录页面曝光。 |
| 18 | `passport_start_verify_click` | 点击开始证件验证 | `KycPassportGuidePage.handleCameraPress()` 先 `sendEvent({ action: Action.StartVerifyClick })`，再检查/请求相机权限，权限通过后调用 `openCamera()`。 | 点击本身无后端动作；权限通过后会请求 passport URL。 | ❌ 不能直接查 | 无确定 SQL 来源。代码有 `Action.StartVerifyClick`，但当前没有确认事件表名/字段；业务库不记录点击。 |
| 19 | `passport_get_url_api` | 请求 passport AAI URL | `openCamera()` 调 `requestPassportUrl()`；store 中 `requestPassportUrl()` 调 `kycService.getPassportUrl()`；成功后跳 `ROUTE_PASSPORT_SCAN`。 | `POST /api/wallet/kyc/passport/get-url`；Controller `getPassportUrl()` 调 `walletService.getPassportUrl()`。 | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/passport/get-url`；日志关键词 `WalletController#getPassportUrl`。 |
| 20 | `passport_request_id_saved` | 写入 passport_request_id | 无独立前端动作；属于 passport get-url 的后端副作用。 | `WalletApplicationServiceImpl.getPassportUrl()` 获取 DTC URL 后调用 `walletApplicationDomainService.updatePassportFlowInit()`；模型 `updateGetPassportUrlFlow()` 写 `passportRequestId`、`passportStatus=INITIAL`、`kycStatus=PROCESSING`。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`passport_request_id IS NOT NULL`；同时 `passport_status` 初始化、`kyc_status = 1/PROCESSING`。 |
| 21 | `passport_scan_page_view` | 进入 passport WebView 扫描页 | `requestPassportUrl()` 成功后 `KycNavigator.navigateToNext({ routeCode: ROUTE_PASSPORT_SCAN, aaiPassportUrl })`；`KycPassportScanPage` 加载 `AixWebview`。 | 无。WebView 页面曝光不触发后端接口。 | ❌ 不能直接查 | 无确定 SQL 来源。前端 PageEvent 路由 `/aix/kyc/passport-scan`、PageName = `TakeIdPhotoResult` 未确认事件落表；业务库不记录 WebView 页面曝光。 |
| 22 | `passport_verify_result_success` | Passport WebView 成功 | `KycPassportScanPage.handleShouldStartLoadWithRequest()` 检测 URL 包含 passport success 后 `sendEvent(Action.VerifyResult, Success)`，再跳 `ROUTE_FACE_PAGE`。 | 无直接后端接口。DTC 回调/后端状态同步是另一条链路，不等同前端 WebView success。 | ❌ 不能直接查 | 无确定 WebView 回调事件 SQL 来源。业务表中的 passport 成功只表示后端 passport 结果成功，不等同于前端 WebView 回调成功。 |
| 23 | `passport_verify_result_failed` | Passport WebView 失败 | `KycPassportScanPage.handleShouldStartLoadWithRequest()` 检测 URL 包含 passport failed 后 `sendEvent(Action.VerifyResult, Failure)`，记录 logger，并 `router.replace(KycPassportGuide)`。 | 无直接后端接口。DTC 回调/后端状态同步是另一条链路。 | ❌ 不能直接查 | 无确定 WebView 回调事件 SQL 来源。业务表中的 passport 失败只表示后端 passport 结果失败，不等同于前端 WebView 回调失败。 |
| 24 | `face_guide_page_view` | 进入 Face Guide | Passport WebView success 后 `KycNavigator.navigateToNext({ routeCode: ROUTE_FACE_PAGE })`；页面组件为 `KycLivenessGuidePage`。 | 无。页面曝光不触发后端接口。 | ❌ 不能直接查 | 页面存在，路由 `/aix/kyc/face-guide`；但 `PageNameMap` 没有 KycFaceGuide 映射，且业务库不记录页面曝光。 |
| 25 | `face_continue_click` | Face Guide 点击 Continue | `KycLivenessGuidePage.handleContinuePress()` 检查/请求相机权限；权限通过后调用 `doContinue()`。未看到 `sendEvent`。 | 点击本身无后端动作；权限通过后会请求 liveness URL。 | ❌ 不能直接查 | 代码有点击逻辑，但未看到 `sendEvent`；业务库不记录点击。 |
| 26 | `liveness_get_url_api` | 请求 liveness AAI URL | `useKycLivenessGuideStore.doContinue()` 调 `kycService.getLivenessUrl()`；成功后跳 `ROUTE_FACE_SCAN`。 | `POST /api/wallet/kyc/liveness/get-url`；Controller `getLivenessUrl()` 调 `walletService.getKycLivenessUrl()`。 | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/liveness/get-url`；日志关键词 `WalletController#getLivenessUrl`。 |
| 27 | `liveness_request_id_saved` | 写入 liveness_request_id | 无独立前端动作；属于 liveness get-url 的后端副作用。 | `WalletApplicationServiceImpl.getKycLivenessUrl()` 获取 DTC URL 后调用 `walletApplicationDomainService.updateLivenessFlowInit()`；模型 `updateGetLivenessUrlFlow()` 写 `livenessRequestId`、`livenessStatus=INITIAL`、`kycStatus=PROCESSING`。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`liveness_request_id IS NOT NULL`；同时 `liveness_status` 初始化、`kyc_status = 1/PROCESSING`。 |
| 28 | `face_scan_page_view` | 进入 Face Scan WebView | liveness URL 成功后 `KycNavigator.navigateToNext({ routeCode: ROUTE_FACE_SCAN, aaiLivenessUrl })`；`KycLivenessScanPage` 加载 `AixWebview`。 | 无。WebView 页面曝光不触发后端接口。 | ❌ 不能直接查 | 页面存在，路由 `/aix/kyc/face-scan`；但 `PageNameMap` 没有 KycFaceScan 映射，且业务库不记录 WebView 页面曝光。 |
| 29 | `face_scan_finished` | Face WebView 完成，成功/失败都进轮询 | `KycLivenessScanPage.handleShouldStartLoadWithRequest()` 检测 face success 或 failed URL 后跳 `ROUTE_PASSPORT_FACE_LOADING_PAGE`；failed 时仅 logger。未看到 `sendEvent`。 | 无直接后端接口；下一步轮询接口是独立动作。 | ❌ 不能直接查 | 无确定 SQL 来源。前端未看到 `sendEvent`，业务库不记录 Face WebView 完成事件。 |
| 30 | `passport_face_result_polling` | 轮询 passport + face 结果 | `KycResultPollingStore.startPolling()` 调 `kycService.pollResult()`，循环请求直到 processing 结束或超时。 | `POST /api/wallet/kyc/loading-passport-face-result`；Controller `checkLoadingPassportFaceResult()` 调 `walletService.checkLoadingPassportFaceResult()`。 | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/loading-passport-face-result`；日志关键词 `WalletController#checkLoadingPassportFaceResult`。 |
| 31 | `passport_or_liveness_processing` | 证件/活体处理中 | 轮询结果为 `PROCESSING` 时 `useKycResultPollingStore.handlePollResult()` 返回 true，继续轮询。 | `WalletApplicationServiceImpl.checkLoadingPassportFaceResult()` 在 passport 或 liveness 为 processing 时返回 `ResultCode.PROCESSING`。 | ✅ 可直接查 | 接口日志返回 `PROCESSING`；业务表可查 `passport_status=1` 或 `liveness_status=1`。 |
| 32 | `passport_or_liveness_failed` | 证件/活体失败 | 轮询结果 `KYC_FAILED` 时前端进入 Failed 状态并展示失败 UI。 | `WalletApplicationServiceImpl.checkLoadingPassportFaceResult()` 在 passport/liveness 任一失败时返回 `ResultCode.KYC_FAILED`。 | ✅ 可直接查 | `wallet_application.passport_status=2` 或 `liveness_status=2`；也可查 `kyc_info_record.status=2`。 |
| 33 | `route_to_poa_page` | 后端返回 POA 页面路由 | 轮询结果 code 是 `ROUTE_POA_PAGE` 时，`useKycResultPollingStore.handlePollResult()` 调 `KycNavigator.navigateToNext()`。 | `WalletApplicationServiceImpl.checkLoadingPassportFaceResult()` 在 `determineRouteCode()` 为 `ROUTE_POA_PAGE` 时返回该 route code 和国家信息。 | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/loading-passport-face-result`；日志关键词 `WalletController#checkLoadingPassportFaceResult`；result code = `ROUTE_POA_PAGE`。只证明后端返回 POA 路由，不证明 POA 页面已曝光。 |
| 34 | `poa_page_view` | 进入 POA 页面 | `KycNavigator.navigateToNext()` 根据 `ROUTE_POA_PAGE` replace 到 `RouterNames.KycPoa`；页面组件为 `KycPoaPage`。 | 无。页面曝光不触发后端接口。 | ❌ 不能直接查 | 无确定 SQL 来源。前端 PageEvent 路由 `/aix/kyc/poa`、PageName = `AddressUpload` 未确认事件落表；业务库不记录页面曝光。 |
| 35 | `poa_country_select_open` | POA 页打开国家选择 | `KycPoaPage` 国家区域 `Pressable.onPress` 调 `handleCountrySelect()`，执行 `router.push(RouterNames.KycSupportedRegionSelect)`。 | 无。打开国家选择页不触发后端接口。 | ❌ 不能直接查 | 无确定 SQL 来源。代码未看到独立 click 埋点或业务落库。POA confirm 请求中的 countryCode 只能说明提交时国家值，不证明打开国家选择。 |
| 36 | `poa_upload_click` | 点击 POA Upload | `KycPoaPage.handleUpload()` 先 `sendEvent({ action: Action.UploadClick })`，再打开 `showUploadBottomSheet()`。 | 无。点击 Upload 本身不触发后端接口；选择文件后才上传。 | ❌ 不能直接查 | 无确定 SQL 来源。代码仅确认前端 `Action.UploadClick` 会发送到 Native Bridge，当前无事件表名/字段；后端 `/api/wallet/kyc/poa/upload` 只能说明文件上传发生，不能还原点击 Upload。 |
| 37 | `poa_select_upload_type` | 选择上传类型 files/album | `handleUpload()` 在 bottom sheet 返回 source 后 `sendEvent({ action: Action.SelectUploadType, extra: { fileType: source } })`；source 只支持 `files` / `album`。 | 无。选择上传类型本身不触发后端接口；之后才调用文件选择或相册选择。 | ❌ 不能直接查 | 无确定 SQL 来源。代码仅确认前端 `Action.SelectUploadType` 会发送到 Native Bridge，当前无事件表名/字段；后端上传接口不稳定表达用户选择的是 files 还是 album。 |
| 38 | `poa_take_photo_click` | 点击拍照上传 | POA 页面相机 icon `onPress` 调 `handleCameraPermission()`；该方法先 `sendEvent({ action: Action.TakePhotoClick })`，再检查/请求相机权限并 launch camera。 | 无。拍照点击本身不触发后端接口；拍照成功并选择文件后才上传。 | ❌ 不能直接查 | 无确定 SQL 来源。代码仅确认前端 `Action.TakePhotoClick` 会发送到 Native Bridge，当前无事件表名/字段；后端上传接口只能说明 POA 文件上传，不区分拍照点击。 |
| 39 | `poa_file_upload_api` | POA 文件上传 | `handleFileSelected()` 调 `selectAndUploadFile(file)`；store 调 `kycService.uploadPoaFile()`。 | `POST /api/wallet/kyc/poa/upload` multipart；Controller `poaUpload()` 调 `walletService.poaUpload()`。 | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/poa/upload`；日志关键词 `WalletController#poaUpload`。 |
| 40 | `poa_upload_success_frontend` | 前端上传成功，拿到 fileId/fileUrl | `useKycPoaStore.selectAndUploadFile()` 在 upload result ok 后设置 `uploadedFileId`、`uploadedFileUrl`、`state=UploadSuccess`。 | 后端 `poaUpload()` 成功返回 `PoaUploadResponseVO`，日志 `Upload completed` 打印 result。Domain `uploadAndSave()` 创建 POA `kyc_info_record`、上传 OSS、保存 record、更新 `poaRequestId`、`poaStatus=INITIAL`、`kycStatus=PROCESSING`。 | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/poa/upload`；日志关键词 `WalletController#poaUpload` + `Upload completed`。业务表可看 `wallet_application.poa_request_id IS NOT NULL` 或 `kyc_info_record.type = 4`。 |
| 41 | `poa_submit_click` | 点击 POA Continue/Submit | POA Continue 按钮 `onPress` 调 `handleContinue()`；方法先 `sendEvent({ action: Action.SubmitClick })`，再调用 `confirmPoa()`。 | 点击本身无后端动作；随后会调 POA confirm。 | ❌ 不能直接查 | 无确定 SQL 来源。代码有 `Action.SubmitClick`，但当前没有确认事件表名/字段；业务库不记录按钮点击。后续 `/api/wallet/kyc/poa/confirm` 只能说明 POA confirm 发生。 |
| 42 | `poa_confirm_api` | POA confirm 提交 | `useKycPoaStore.confirmPoa()` 读取 `uploadedFileId` 和 `selectedCountry`，调用 `kycService.confirmPoa({ fileId, countryCode })`。 | `POST /api/wallet/kyc/poa/confirm`；Controller `poaConfirm()` 调 `walletService.poaConfirm()`。 | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/poa/confirm`；日志关键词 `WalletController#poaConfirm`。 |
| 43 | `kyc_application_under_review` | KYC 完整提交，进入审核 | `KycPoaPage.handleContinue()` 中 `confirmPoa()` 成功后跳 `KycRouteCode.KYC_SUCCESS`。 | `WalletApplicationDomainServiceImpl.updatePoaUploadConfirm()` 调模型 `updatePoaUploadConfirm()`，将 `kycStatus=UNDER_REVIEW` 并更新 POA record 和 wallet_application。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`kyc_status = 2`；时间字段优先 `update_time`。 |
| 44 | `kyc_submit_result_page_view` | 进入提交结果页 | `KycPoaPage.handleContinue()` 在 POA confirm success 后 `KycNavigator.navigateToNext({ routeCode: KYC_SUCCESS })`，路由到 `RouterNames.KycSuccess`。 | 无。页面曝光不触发后端接口。 | ❌ 不能直接查 | 无确定 SQL 来源。前端 PageEvent 路由 `/aix/kyc/success`、PageName = `OpenWalletSubmitResult` 未确认事件落表；业务库不记录页面曝光。`wallet_application.kyc_status = 2` 只能说明进入审核，不证明提交结果页曝光。 |
| 45 | `kyc_final_approved` | 最终 KYC 通过 | 无直接前端动作；由后端审核结果驱动。 | `WalletApplicationDomainServiceImpl.handleKycReviewResult()` 根据 DTC `kycResult` 更新 `wallet_application.kyc_status=SUCCESS`，并更新相关 `kyc_info_record`。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`kyc_status = 5`；时间字段 `finished_time`。 |
| 46 | `kyc_final_failed` | 最终 KYC 失败 | 无直接前端动作；由后端审核结果或异常处理驱动。 | `handleKycReviewResult()` 或相关失败处理更新 `wallet_application.kyc_status=FAILED`，并更新相关 `kyc_info_record`。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`kyc_status = 3`；时间字段 `finished_time`。 |
| 47 | `kyc_final_rejected` | 最终 KYC 拒绝 | 无直接前端动作；由后端审核结果驱动。 | `handleKycReviewResult()` 根据 DTC `kycResult` 更新 `wallet_application.kyc_status=REJECTED`，并更新相关 `kyc_info_record`。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`kyc_status = 4`；时间字段 `finished_time`。 |

## 当前可直接写 SQL 的核心节点

| 节点 | 表 / 日志 | 条件 |
|---|---|---|
| KYC start 接口 | Doris 后端日志 | `WalletController#startKyc` 或 `/api/wallet/kyc/start` |
| KYC start route 决策 | Doris 后端日志 | `WalletController#startKyc` result code |
| 国家列表加载 | Doris 后端日志 | `GET /api/config/phone-area-list/kyc-start-page` |
| Start 页提交 | Doris 后端日志 | `WalletController#startKycPageSubmit` 或 `/api/wallet/kyc/start-page/submit` |
| 协议确认 | `aixpay_app.user_agreement_consent` | `location = 'KYC_START'` |
| KYC 主申请创建 | `aixpay_wallet.wallet_application` | `user_id` 有记录 |
| 国家提交成功 | `wallet_application` | `nationality IS NOT NULL` |
| Passport Guide route 返回 | Doris 后端日志 | `WalletController#startKycPageSubmit` result code = `ROUTE_PASSPORT_PAGE` |
| Passport URL 获取 | Doris 后端日志 | `WalletController#getPassportUrl` 或 `/api/wallet/kyc/passport/get-url` |
| Passport 开始 | `wallet_application` | `passport_request_id IS NOT NULL` |
| Passport 状态 | `wallet_application` / `kyc_info_record` | `passport_status` 或 `type = 1` |
| Liveness URL 获取 | Doris 后端日志 | `WalletController#getLivenessUrl` 或 `/api/wallet/kyc/liveness/get-url` |
| Liveness 开始 | `wallet_application` | `liveness_request_id IS NOT NULL` |
| Liveness 状态 | `wallet_application` / `kyc_info_record` | `liveness_status` 或 `type IN (2,3)` |
| Passport + Face 轮询 | Doris 后端日志 | `WalletController#checkLoadingPassportFaceResult` 或 `/api/wallet/kyc/loading-passport-face-result` |
| POA route 返回 | Doris 后端日志 | `WalletController#checkLoadingPassportFaceResult` result code = `ROUTE_POA_PAGE` |
| POA 文件上传 | Doris 后端日志 | `WalletController#poaUpload` 或 `/api/wallet/kyc/poa/upload` |
| POA 状态 | `wallet_application` / `kyc_info_record` | `poa_status` 或 `type = 4` |
| POA confirm | Doris 后端日志 | `WalletController#poaConfirm` 或 `/api/wallet/kyc/poa/confirm` |
| 进入审核 | `wallet_application` | `kyc_status = 2` |
| 最终通过 | `wallet_application` | `kyc_status = 5` |
| 最终失败 | `wallet_application` | `kyc_status = 3` |
| 最终拒绝 | `wallet_application` | `kyc_status = 4` |
