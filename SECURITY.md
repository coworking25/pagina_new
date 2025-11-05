# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Known Security Issues

### High Severity

#### 1. xlsx Library Vulnerabilities
**Status:** ⚠️ Known Issue  
**Severity:** High  
**Description:** The `xlsx` library has known vulnerabilities:
- Prototype Pollution (GHSA-4r6h-8v6p-xvw6)
- Regular Expression Denial of Service (GHSA-5pgg-2g8v-p4x9)

**Impact:** 
- Potential DoS attacks through maliciously crafted Excel files
- Prototype pollution could lead to unexpected behavior

**Mitigation:**
- The library is only used for data export functionality
- Limited exposure as it's admin-only feature
- Input validation in place

**Recommended Action:**
Consider replacing `xlsx` with a more secure alternative:
```bash
npm uninstall xlsx
npm install exceljs
```

Then update import statements:
```typescript
// Old
import * as XLSX from 'xlsx';

// New
import ExcelJS from 'exceljs';
```

### Moderate Severity

#### 2. esbuild/Vite Development Server
**Status:** ⚠️ Known Issue  
**Severity:** Moderate  
**Description:** Development server vulnerability allowing unauthorized requests

**Impact:**
- Only affects development environment
- Does not impact production builds

**Mitigation:**
- Do not expose development server to public networks
- Use production builds for deployment

**Recommended Action:**
Update to Vite 7.x when available (breaking changes):
```bash
npm install vite@latest
```

## Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use `.env.example` as template
- ✅ Rotate API keys regularly
- ✅ Use different keys for dev/staging/production

### Authentication
- ✅ Supabase handles password hashing
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ JWT tokens used for session management
- ⚠️ Consider enabling 2FA for admin accounts

### Database Security
- ✅ RLS policies restrict data access by role
- ✅ Prepared statements prevent SQL injection
- ✅ Service role key kept server-side only
- ⚠️ Regular audit of RLS policies recommended

### API Security
- ✅ CORS configured in Supabase
- ✅ Rate limiting enabled in Supabase
- ⚠️ Consider additional rate limiting for public endpoints
- ⚠️ Implement request signing for sensitive operations

### File Upload Security
- ✅ File size limits enforced
- ✅ Storage bucket policies restrict access
- ⚠️ Add virus scanning for production
- ⚠️ Validate file types server-side

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **DO NOT** open a public issue
2. Email the security team at: security@coworkinginmobiliario.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline
- Acknowledgment: Within 48 hours
- Initial assessment: Within 1 week
- Status update: Every 2 weeks
- Fix deployment: Varies by severity

## Security Checklist for Developers

### Before Committing Code
- [ ] No hardcoded credentials
- [ ] No API keys in code
- [ ] Sensitive data encrypted
- [ ] Input validation implemented
- [ ] Error messages don't leak information
- [ ] Dependencies updated

### Before Deploying
- [ ] Run `npm audit`
- [ ] Environment variables set correctly
- [ ] HTTPS enabled
- [ ] Database backups configured
- [ ] Monitoring and logging enabled
- [ ] Rate limiting configured

### Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Review and rotate API keys quarterly
- [ ] Audit RLS policies quarterly
- [ ] Review user permissions monthly
- [ ] Check security logs weekly

## Security Tools

### Recommended Tools
```bash
# Check for known vulnerabilities
npm audit

# Check for outdated dependencies
npm outdated

# Scan for secrets in code (install globally)
npm install -g gitleaks
gitleaks detect --source . --verbose

# Check dependency licenses
npx license-checker --summary
```

### CI/CD Security
Consider adding to CI pipeline:
- Automated vulnerability scanning
- Dependency checking
- Secret scanning
- SAST (Static Application Security Testing)
- DAST (Dynamic Application Security Testing)

## Secure Coding Guidelines

### Input Validation
```typescript
// ✅ Good - Validate and sanitize
const email = input.trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error('Invalid email');
}

// ❌ Bad - No validation
const email = input;
await saveToDatabase(email);
```

### SQL Queries
```typescript
// ✅ Good - Use Supabase query builder
const { data } = await supabase
  .from('users')
  .select()
  .eq('id', userId);

// ❌ Bad - String concatenation (even in Supabase, avoid raw SQL)
const query = `SELECT * FROM users WHERE id = '${userId}'`;
```

### Authentication Checks
```typescript
// ✅ Good - Always verify authentication
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return redirect('/login');
}

// ❌ Bad - Trust client-side data
if (localStorage.getItem('isLoggedIn')) {
  // Allow access
}
```

### Error Handling
```typescript
// ✅ Good - Generic error messages
try {
  await sensitiveOperation();
} catch (error) {
  console.error(error); // Log detailed error
  return { error: 'Operation failed' }; // Return generic message
}

// ❌ Bad - Expose internal details
try {
  await sensitiveOperation();
} catch (error) {
  return { error: error.message }; // May leak sensitive info
}
```

## Incident Response Plan

### In Case of Security Breach

1. **Immediate Actions**
   - Isolate affected systems
   - Preserve evidence
   - Notify security team

2. **Assessment**
   - Determine scope of breach
   - Identify compromised data
   - Document timeline

3. **Containment**
   - Patch vulnerability
   - Rotate compromised credentials
   - Update affected users

4. **Recovery**
   - Restore from backups if needed
   - Verify system integrity
   - Monitor for suspicious activity

5. **Post-Incident**
   - Document lessons learned
   - Update security procedures
   - Implement additional safeguards

## Compliance

### Data Protection
- GDPR considerations for EU users
- User data encryption at rest
- Right to data deletion implemented
- Data retention policies defined

### Audit Trail
- Authentication events logged
- Critical operations logged
- Logs retained for 90 days
- Regular log review process

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.io/docs/guides/auth/security)
- [React Security Best Practices](https://snyk.io/learn/react-security/)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)

---

*Last Updated: November 2025*  
*Next Review: December 2025*
