import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {

    const body = await req.json();

    console.log("BODY:", body);

    const order_id = body.order_id;
    const gross_amount = Number(body.gross_amount);

    const customer = body.customer || {};

    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");

    console.log("SERVER KEY ADA:", !!serverKey);

    const encodedKey = btoa(`${serverKey}:`);

    const payload = {
      transaction_details: {
        order_id,
        gross_amount,
      },
      customer_details: {
        first_name: customer.first_name || "Customer",
        email: customer.email || "customer@email.com",
      },
    };

    console.log("PAYLOAD:", payload);

    const response = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Basic ${encodedKey}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log("MIDTRANS RESPONSE:", data);

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (err) {

    console.log("ERROR:", err);

    return new Response(
      JSON.stringify({
        success: false,
        error: String(err),
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