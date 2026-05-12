import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import midtransClient from "npm:midtrans-client";

serve(async (req) => {

  try {

    const {
      order_id,
      gross_amount,
      customer_name,
      customer_email
    } = await req.json();

    const snap = new midtransClient.Snap({

      isProduction: false,

      serverKey:
        "Mid-server-pCQgotkPfv-c2Qj3aACQ8nbC",

    });

    const parameter = {

      transaction_details: {

        order_id,
        gross_amount,

      },

      customer_details: {

        first_name: customer_name,
        email: customer_email,

      },

    };

    const transaction =
      await snap.createTransaction(parameter);

    return new Response(

      JSON.stringify({
        token: transaction.token,
      }),

      {
        headers: {
          "Content-Type": "application/json",
        },
      }

    );

  } catch (error) {

    return new Response(

      JSON.stringify({
        error: error.message,
      }),

      {
        status: 500,
      }

    );
  }
});