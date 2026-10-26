export const TelephonyService = {
  async dialCall() {
    throw new Error('Outbound carrier integration is not connected. No call was initiated.');
  }
};
