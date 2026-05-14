import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {

  // HANDLE CORS PREFLIGHT
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {

    // AMBIL DATA DARI FRONTEND
    const body = await req.json();

    const order_id = body.order_id;
    const gross_amount = body.gross_amount;
    const customer = body.customer;

    // AMBIL SERVER KEY DARI SUPABASE SECRET
    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");

    // ENCODE BASIC AUTH
    const encodedKey = btoa(`${serverKey}:`);

    // REQUEST KE MIDTRANS
    const response = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodedKey}`,
        },
        body: JSON.stringify({
          transaction_details: {
            order_id,
            gross_amount,
          },
          customer_details: customer,
        }),
      }
    );

    // RESPONSE DARI MIDTRANS
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (err) {

    return new Response(
      JSON.stringify({
        success: false,
        error: err.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  }

});