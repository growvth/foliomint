import dns from 'node:dns/promises';

export async function verifyFoliomintDomainTxt(domain: string, token: string): Promise<boolean> {
  const name = `_foliomint.${domain}`.replace(/\.$/, '');
  try {
    const records = await dns.resolveTxt(name);
    const flat = records.flat().join('');
    const expected = `foliomint-verify=${token}`;
    return flat.includes(expected) || flat.includes(token);
  } catch {
    return false;
  }
}
