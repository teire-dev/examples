package dev.teire.relay

import okhttp3.MediaType
import okhttp3.OkHttpClient
import okhttp3.Protocol
import okhttp3.Request
import okhttp3.Response
import okhttp3.ResponseBody
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class WebhookClientTest {
    private val seen = mutableListOf<Request>()

    /** An OkHttp client that answers every call itself with `code` and records the request. */
    private fun answering(code: Int): OkHttpClient =
        OkHttpClient.Builder()
            .addInterceptor { chain ->
                seen += chain.request()
                Response.Builder()
                    .request(chain.request())
                    .protocol(Protocol.HTTP_1_1)
                    .code(code)
                    .message("canned")
                    .body("".toResponseBody("text/plain".toMediaTypeOrNull()!!))
                    .build()
            }
            .build()

    @Test
    fun deliversJsonToTheResolvedPath() {
        val status = WebhookClient(answering(202), "https://hooks.example.com/v1/").deliver("events", """{"id":1}""")
        assertEquals(202, status)
        assertEquals("https://hooks.example.com/v1/events", seen.single().url.toString())
        assertEquals("POST", seen.single().method)
        assertEquals("application/json; charset=utf-8", seen.single().body!!.contentType().toString())
    }

    @Test
    fun acceptedOnlyFor2xx() {
        assertTrue(WebhookClient(answering(204), "https://hooks.example.com/").accepted("e", "{}"))
        assertFalse(WebhookClient(answering(500), "https://hooks.example.com/").accepted("e", "{}"))
    }

    @Test
    fun rejectsABadBaseUrl() {
        assertThrows<IllegalArgumentException> { WebhookClient(answering(200), "not a url") }
    }
}
