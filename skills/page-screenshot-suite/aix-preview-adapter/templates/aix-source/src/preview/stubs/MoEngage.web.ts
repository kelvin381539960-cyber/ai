export class MoEProperties {
  private attributes: Record<string, unknown> = {};
  addAttribute(key: string, value: unknown) { this.attributes[key] = value; return this; }
  getGeneralAttributes() { return { ...this.attributes }; }
}
export class MoEPushConfig { static defaultConfig() { return new MoEPushConfig(); } }
export class MoEngageLogConfig { constructor(public level?: unknown, public enabled?: boolean) {} }
export const MoEngageLogLevel = { DEBUG: 'DEBUG', INFO: 'INFO', VERBOSE: 'VERBOSE' } as const;
export class MoEInitConfig { constructor(public pushConfig?: unknown, public logConfig?: unknown) {} }
const noop = () => undefined;
const ReactMoE = {
  initialize: noop, identifyUser: noop, logout: noop, setUserAttribute: noop,
  setUserEmailID: noop, passFcmPushToken: noop, passFcmPushPayload: noop,
  setEventListener: noop, trackEvent: noop, setCurrentContext: noop,
  resetCurrentContext: noop, showInApp: noop, showNudge: noop,
  pushPermissionResponseAndroid: noop,
};
export default ReactMoE;
