# EmailJS Template Example

## Template Subject
Invoice from BuildLedger - {{invoice_number}}

## Template Body (HTML)
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice from BuildLedger</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello {{to_name}},</h2>
        
        <p style="color: #555; line-height: 1.6;">
            Here is your invoice for <strong>{{invoice_total}}</strong>.
        </p>
        
        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Invoice Number:</strong> {{invoice_number}}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> {{invoice_total}}</p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> {{invoice_due_date}}</p>
        </div>
        
        <p style="color: #555; line-height: 1.6;">
            Please review the invoice details above. If you have any questions, please don't hesitate to contact us.
        </p>
        
        <p style="color: #555; line-height: 1.6;">
            Thank you for your business!
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #888; font-size: 14px; text-align: center;">
            Best regards,<br>
            BuildLedger Team
        </p>
    </div>
</body>
</html>
```

## Template Variables Used
- `{{to_email}}` - Automatically set by EmailJS
- `{{to_name}}` - Client's name
- `{{invoice_number}}` - Generated invoice number (e.g., INV-12345678)
- `{{invoice_total}}` - Formatted total amount (e.g., $1,250.00)
- `{{invoice_due_date}}` - Formatted due date (e.g., 12/31/2024)

## Setup Instructions
1. Go to EmailJS Dashboard → Email Templates
2. Create a new template
3. Copy the HTML above into the template
4. Set the subject line
5. Save the template and copy the Template ID
6. Add the Template ID to your `.env.local` file as `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`

## Notes
- The free tier of EmailJS doesn't support file attachments
- For production use with PDF attachments, consider upgrading to a paid plan or using a different service
- The template is responsive and works well on mobile devices 