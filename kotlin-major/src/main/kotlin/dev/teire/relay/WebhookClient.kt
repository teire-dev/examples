package dev.teire.relay

import okhttp3.HttpUrl
import okhttp3.MediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.MediaType.Companion.toMediaTypeOrNull

/** Relays JSON events to a partner's webhook endpoint. */
class WebhookClient(private val client: OkHttpClient, base: String) {
    private val baseUrl: HttpUrl = base.toHttpUrlOrNull() ?: throw IllegalArgumentException("bad base URL: $base")

    /** POSTs the event to `path` under the base URL; returns the HTTP status. */
    fun deliver(path: String, json: String): Int {
        val url = baseUrl.resolve(path) ?: throw IllegalArgumentException("bad path: $path")
        val request = Request.Builder().url(url).post(json.toRequestBody(JSON)).build()
        client.newCall(request).execute().use { response -> return response.code }
    }

    /** True when the partner answers with a 2xx status. */
    fun accepted(path: String, json: String): Boolean = deliver(path, json) in 200..299

    companion object {
        val JSON: MediaType = "application/json; charset=utf-8".toMediaTypeOrNull()!!
    }
}
