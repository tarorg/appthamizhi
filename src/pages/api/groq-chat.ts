console.log('groq-chat.ts loaded');

import type { APIRoute } from 'astro';
import { Groq } from 'groq-sdk';

export const post: APIRoute = async ({ request }) => {
  console.log('Groq chat API route called');
  const apiKey = import.meta.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error('GROQ_API_KEY is not set in the environment variables');
    return new Response(JSON.stringify({ 
      error: 'GROQ_API_KEY is not configured',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  console.log('GROQ_API_KEY is set');

  const groq = new Groq({
    apiKey: apiKey,
  });

  try {
    const body = await request.json();
    const { messages } = body;

    console.log('Received messages:', JSON.stringify(messages, null, 2));

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid or empty messages array');
    }

    console.log('Sending request to Groq API');
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1,
      stream: false,
      stop: null,
    });

    console.log('Groq response:', JSON.stringify(chatCompletion, null, 2));

    if (!chatCompletion.choices || chatCompletion.choices.length === 0 || !chatCompletion.choices[0].message.content) {
      throw new Error('No valid response from Groq API');
    }

    const reply = chatCompletion.choices[0].message.content.trim();

    if (!reply) {
      throw new Error('Empty response from Groq API');
    }

    return new Response(JSON.stringify({
      reply: reply,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in Groq chat:', error);
    let errorMessage = 'Failed to get response from Groq';
    let errorDetails = '';

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || '';
    } else {
      errorDetails = String(error);
    }

    console.error('Error details:', errorDetails);

    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: errorDetails
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};