# EmailJS Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Add Email Service
1. In your EmailJS dashboard, go to **Email Services**
2. Click **"Add New Service"**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps
5. **Copy the Service ID** (you'll need this)

### Step 3: Create Email Template
1. Go to **Email Templates**
2. Click **"Create New Template"**
3. Set the subject: `Invoice from BuildLedger - {{invoice_number}}`
4. Copy the HTML from `EMAILJS_TEMPLATE_EXAMPLE.md` into the template
5. Save the template
6. **Copy the Template ID** (you'll need this)

### Step 4: Get API Key
1. Go to **Account → API Keys**
2. **Copy the Public Key** (you'll need this)

### Step 5: Update Environment Variables
Add these to your `.env.local` file:
```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_0hlf5ay
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_cvmbyfw
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=BehqqC4TDPEAwT4N1
```

### Step 6: Test
1. Restart your development server
2. Go to an invoice detail page
3. Click "Send to Client"
4. Check your email!

## 🎯 Benefits of EmailJS

✅ **No Domain Verification Required** - Works immediately  
✅ **Free Tier** - 200 emails/month included  
✅ **Easy Setup** - No complex configuration  
✅ **Professional Templates** - Beautiful, responsive emails  
✅ **Reliable Delivery** - Uses your existing email provider  

## 🔧 Troubleshooting

### "Service ID not found"
- Make sure you copied the correct Service ID from Email Services
- Check that the service is active in your EmailJS dashboard

### "Template ID not found"
- Verify the Template ID is correct
- Ensure the template is saved and active

### "Public Key invalid"
- Check that you're using the Public Key (not Private Key)
- Verify the key is copied correctly without extra spaces

### Emails not sending
- Check your email service authentication
- Verify your email provider allows API access
- Check the browser console for error messages

## 📧 Email Template Variables

Your template can use these variables:
- `{{to_email}}` - Client's email (auto-filled)
- `{{to_name}}` - Client's name
- `{{invoice_number}}` - Invoice number (e.g., INV-12345678)
- `{{invoice_total}}` - Total amount (e.g., $1,250.00)
- `{{invoice_due_date}}` - Due date (e.g., 12/31/2024)

## 🔄 Migration from Resend

If you were previously using Resend:
1. Remove `RESEND_API_KEY` from your `.env.local`
2. Add the EmailJS variables above
3. The "Send to Client" button will now use EmailJS
4. No code changes needed - it's all handled automatically!

## 💡 Pro Tips

- **Test with your own email first** - Send a test invoice to yourself
- **Customize the template** - Add your company logo and branding
- **Monitor usage** - Check your EmailJS dashboard for email counts
- **Upgrade when needed** - Paid plans support file attachments

---

**Need help?** Check the EmailJS documentation or create an issue in this repository. 