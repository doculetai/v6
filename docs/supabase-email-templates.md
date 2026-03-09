# Supabase Email Templates

Paste these HTML templates into the Supabase Authentication → Email Templates dashboard.

## Reset Password

Subject: Reset your Doculet password

```html
<div style="font-family: 'IBM Plex Sans', sans-serif; background: #FDFCFA; padding: 40px 24px; max-width: 560px; margin: 0 auto;">
  <p style="font-size: 20px; font-weight: 600; color: #1a1a1a;">Reset your password</p>
  <p style="font-size: 14px; color: #555; line-height: 1.6;">
    A password reset was requested for your Doculet account.
  </p>
  <a href="{{ .ConfirmationURL }}"
    style="display: inline-block; background: #2B39A3; color: #fff; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 24px; text-decoration: none;">
    Reset password
  </a>
  <p style="font-size: 12px; color: #999; margin-top: 40px;">
    If you did not request this, ignore this email. The link expires in 1 hour.
  </p>
</div>
```

## Invite User

Subject: You have been invited to Doculet

```html
<div style="font-family: 'IBM Plex Sans', sans-serif; background: #FDFCFA; padding: 40px 24px; max-width: 560px; margin: 0 auto;">
  <p style="font-size: 20px; font-weight: 600; color: #1a1a1a;">You have been invited to Doculet</p>
  <p style="font-size: 14px; color: #555; line-height: 1.6;">
    Accept your invitation to access your Doculet dashboard.
  </p>
  <a href="{{ .ConfirmationURL }}"
    style="display: inline-block; background: #2B39A3; color: #fff; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 24px; text-decoration: none;">
    Accept invitation
  </a>
  <p style="font-size: 12px; color: #999; margin-top: 40px;">
    Doculet — Proof of Funds Verification
  </p>
</div>
```

## Magic Link / OTP

```html
<div style="font-family: 'IBM Plex Sans', sans-serif; background: #FDFCFA; padding: 40px 24px; max-width: 560px; margin: 0 auto;">
  <p style="font-size: 20px; font-weight: 600; color: #1a1a1a;">Sign in to Doculet</p>
  <p style="font-size: 14px; color: #555; line-height: 1.6;">
    Use the link below to sign in. This link expires in 1 hour and can only be used once.
  </p>
  <a href="{{ .ConfirmationURL }}"
    style="display: inline-block; background: #2B39A3; color: #fff; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 24px; text-decoration: none;">
    Sign in
  </a>
  <p style="font-size: 12px; color: #999; margin-top: 40px;">
    If you did not request this, ignore this email.
  </p>
</div>
```
