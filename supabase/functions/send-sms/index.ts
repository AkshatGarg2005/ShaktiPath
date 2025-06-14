import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📱 SMS function called')
    const { to, message } = await req.json()

    // Validate input
    if (!to || !message) {
      console.error('❌ Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, message' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`📞 Sending SMS to: ${to}`)
    console.log(`📝 Message length: ${message.length} characters`)

    // Get Fast2SMS API key from environment
    // Try multiple possible environment variable names
    const fast2smsApiKey = Deno.env.get('FAST2SMS_API_KEY') || 
                          Deno.env.get('VITE_FAST2SMS_API_KEY') ||
                          'srIq625XiUNQhLFjnbBK8outx01lYT9OEakeRmDCWvgfdcPSZ3EVuiFonlmSBpHYC1XvhI4t9a5JZRDk'
    
    console.log('🔑 API Key check:', fast2smsApiKey ? `Found (${fast2smsApiKey.substring(0, 10)}...)` : 'Not found')
    
    if (!fast2smsApiKey) {
      console.error('❌ Fast2SMS API key not found in environment')
      return new Response(
        JSON.stringify({ 
          error: 'SMS service not configured', 
          details: 'Fast2SMS API key missing from environment variables' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Clean phone number (remove +91 if present, keep only digits)
    const cleanNumber = to.replace(/^\+91/, '').replace(/\D/g, '')
    console.log(`📱 Cleaned number: ${cleanNumber}`)

    // Validate Indian phone number (should be 10 digits)
    if (cleanNumber.length !== 10) {
      console.error(`❌ Invalid phone number length: ${cleanNumber.length}`)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid phone number', 
          details: 'Indian phone numbers should be 10 digits' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Truncate message if too long (Fast2SMS has character limits)
    const truncatedMessage = message.length > 160 ? message.substring(0, 157) + '...' : message
    
    console.log('🚀 Calling Fast2SMS API...')
    console.log('📋 Request payload:', {
      route: 'q',
      message: truncatedMessage.substring(0, 50) + '...',
      numbers: cleanNumber
    })
    
    // Call Fast2SMS API with proper headers
    const smsResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'Authorization': fast2smsApiKey,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        route: 'q', // Quick route for transactional messages
        message: truncatedMessage,
        language: 'english',
        flash: 0,
        numbers: cleanNumber,
      }),
    })

    console.log(`📡 Fast2SMS response status: ${smsResponse.status}`)
    
    const responseText = await smsResponse.text()
    console.log(`📋 Fast2SMS raw response: ${responseText}`)
    
    if (!smsResponse.ok) {
      console.error('❌ Fast2SMS HTTP error:', responseText)
      
      // Try alternative route immediately if first fails
      console.log('🔄 Trying alternative SMS route (v3)...')
      
      const altResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'Authorization': fast2smsApiKey,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          route: 'v3', // Alternative route
          sender_id: 'FSTSMS',
          message: truncatedMessage,
          language: 'english',
          flash: 0,
          numbers: cleanNumber,
        }),
      })

      console.log(`📡 Alternative route response status: ${altResponse.status}`)
      
      if (altResponse.ok) {
        const altResponseText = await altResponse.text()
        console.log(`📋 Alternative route raw response: ${altResponseText}`)
        
        try {
          const altResult = JSON.parse(altResponseText)
          
          if (altResult.return === true || altResult.status_code === 200) {
            console.log('✅ SMS sent via alternative route')
            return new Response(
              JSON.stringify({ 
                success: true, 
                service: 'Fast2SMS (Alternative Route)',
                messageId: altResult.request_id || altResult.job_id || 'unknown',
                details: `SMS sent to ${cleanNumber} via alternative route`,
                response: altResult
              }),
              { 
                status: 200, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
        } catch (parseError) {
          console.error('❌ Failed to parse alternative route response:', parseError)
        }
      }
      
      // If both routes fail, return detailed error
      return new Response(
        JSON.stringify({ 
          error: 'Fast2SMS API error', 
          details: `HTTP ${smsResponse.status}: ${responseText}`,
          suggestion: 'Please verify your API key and phone number format'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse successful response
    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ Failed to parse Fast2SMS response:', parseError)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from SMS service', 
          details: 'Failed to parse API response'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log('📋 Fast2SMS parsed result:', result)
    
    if (result.return === true || result.status_code === 200) {
      console.log('✅ SMS sent successfully')
      return new Response(
        JSON.stringify({ 
          success: true, 
          service: 'Fast2SMS',
          messageId: result.request_id || result.job_id || 'unknown',
          details: `SMS sent to ${cleanNumber}`,
          response: result
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      console.error('❌ Fast2SMS returned error:', result)
      
      // Try alternative approach with different route
      console.log('🔄 Trying alternative SMS route (dlt)...')
      
      const altResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'Authorization': fast2smsApiKey,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          route: 'dlt', // DLT route
          sender_id: 'FSTSMS',
          message: truncatedMessage,
          language: 'english',
          flash: 0,
          numbers: cleanNumber,
        }),
      })

      if (altResponse.ok) {
        const altResponseText = await altResponse.text()
        console.log('📋 DLT route raw response:', altResponseText)
        
        try {
          const altResult = JSON.parse(altResponseText)
          
          if (altResult.return === true || altResult.status_code === 200) {
            console.log('✅ SMS sent via DLT route')
            return new Response(
              JSON.stringify({ 
                success: true, 
                service: 'Fast2SMS (DLT Route)',
                messageId: altResult.request_id || altResult.job_id || 'unknown',
                details: `SMS sent to ${cleanNumber} via DLT route`,
                response: altResult
              }),
              { 
                status: 200, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
        } catch (parseError) {
          console.error('❌ Failed to parse DLT route response:', parseError)
        }
      }
      
      // If all routes fail, return error with details
      return new Response(
        JSON.stringify({ 
          error: 'SMS sending failed', 
          details: result.message || result.error || 'All SMS routes failed',
          apiResponse: result,
          suggestion: 'Please check your Fast2SMS account balance and API key permissions'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('❌ Error in send-sms function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send SMS', 
        details: error.message,
        suggestion: 'Please verify your phone number and try again, or contact your emergency contact directly'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})