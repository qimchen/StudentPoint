/**
 * 获取当前GMT+8时间的字符串格式
 * @returns 格式: 'YYYY-MM-DD HH:mm:ss'
 */
export function getNowInGMT8(): string {
  const now = new Date();
  const gmt8Time = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return gmt8Time.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * 获取当前GMT+8日期
 * @returns 格式: 'YYYY-MM-DD'
 */
export function getDateInGMT8(): string {
  const now = new Date();
  const gmt8Time = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return gmt8Time.toISOString().slice(0, 10);
}
