//! Drafts a one-line summary of a support ticket with OpenAI's Chat Completions API (async-openai).

use async_openai::{
    config::OpenAIConfig,
    error::OpenAIError,
    types::chat::{
        ChatCompletionRequestSystemMessageArgs, ChatCompletionRequestUserMessageArgs,
        CreateChatCompletionRequestArgs,
    },
    Client,
};

/// The chat model the summaries use.
pub const MODEL: &str = "gpt-5.6-luna";

pub struct Summarizer {
    client: Client<OpenAIConfig>,
}

impl Summarizer {
    /// A summarizer against `api_base` (OpenAI's, or a stand-in in tests).
    pub fn new(api_base: &str, api_key: &str) -> Self {
        let config = OpenAIConfig::new().with_api_base(api_base).with_api_key(api_key);
        Self { client: Client::with_config(config) }
    }

    /// One line describing the ticket.
    pub async fn summarize(&self, ticket: &str) -> Result<String, OpenAIError> {
        let request = CreateChatCompletionRequestArgs::default()
            .model(MODEL)
            .messages([
                ChatCompletionRequestSystemMessageArgs::default()
                    .content("Summarize the support ticket in one sentence.")
                    .build()?
                    .into(),
                ChatCompletionRequestUserMessageArgs::default().content(ticket).build()?.into(),
            ])
            .build()?;
        let response = self.client.chat().create(request).await?;
        Ok(response
            .choices
            .first()
            .and_then(|c| c.message.content.clone())
            .unwrap_or_default())
    }
}
