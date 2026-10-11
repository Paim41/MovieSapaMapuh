package com.pencarimovie.server

import android.content.Context
import fi.iki.elonen.NanoHTTPD
import org.json.JSONArray
import org.json.JSONObject
import java.net.URI
import java.net.URLDecoder

/** Configuration adapter for Android's native server (the APK does not run PHP). */
class YouTubePlaylists(context: Context) {
    private val prefs = context.getSharedPreferences("youtube_playlists", Context.MODE_PRIVATE)

    @Synchronized fun serve(session: NanoHTTPD.IHTTPSession): NanoHTTPD.Response {
        fun response(code: NanoHTTPD.Response.Status, data: JSONObject) =
            NanoHTTPD.newFixedLengthResponse(code, "application/json; charset=utf-8", data.toString()).apply { addHeader("Cache-Control", "no-store") }
        fun error(code: NanoHTTPD.Response.Status, message: String) = response(code, JSONObject().put("error", message))
        if (session.method != NanoHTTPD.Method.GET && session.method != NanoHTTPD.Method.POST) return error(NanoHTTPD.Response.Status.METHOD_NOT_ALLOWED, "Method not allowed.")
        return try {
            val current = JSONObject(prefs.getString("configuration", null) ?: "{\"revision\":0,\"playlists\":[]}")
            if (session.method == NanoHTTPD.Method.POST) {
                val origin = session.headers["origin"]
                if (session.headers["x-msp-playlists"] != "1" || !(session.headers["content-type"] ?: "").startsWith("application/json") ||
                    (origin != null && (URI(origin).rawAuthority != session.headers["host"] || URI(origin).scheme !in listOf("http", "https")))) {
                    return error(NanoHTTPD.Response.Status.FORBIDDEN, "Same-origin JSON request required.")
                }
                if ((session.headers["content-length"]?.toLongOrNull() ?: Long.MAX_VALUE) > 131072) return error(NanoHTTPD.Response.Status.BAD_REQUEST, "Configuration too large.")
                val body = hashMapOf<String, String>(); session.parseBody(body)
                val input = JSONObject(body["postData"] ?: "")
                if (input.opt("revision") != current.get("revision")) return error(NanoHTTPD.Response.Status.CONFLICT, "Playlists changed elsewhere. Reload before saving.")
                val items = input.getJSONArray("playlists")
                require(items.length() <= 100) { "Use at most 100 playlists." }
                val clean = JSONArray(); val seen = hashSetOf<String>()
                for (i in 0 until items.length()) {
                    val item = items.getJSONObject(i)
                    val url = item.getString("url")
                    require(url.length <= 2048 && !Regex("[\\x00-\\x20\\\\]").containsMatchIn(url)) { "Invalid YouTube URL." }
                    val uri = URI(url)
                    require(uri.scheme?.lowercase() in listOf("http", "https") && uri.host?.lowercase() in listOf("youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be") && uri.userInfo == null && uri.port == -1 && Regex(if (uri.host?.lowercase() == "youtu.be") "^/[A-Za-z0-9_-]{11}/?$" else "^/(?:playlist|watch)/?$").matches(uri.rawPath ?: "")) { "Use a standard YouTube playlist or watch URL." }
                    val ids = (uri.rawQuery ?: "").split('&').map { it.split('=', limit = 2) }.filter { URLDecoder.decode(it[0], "UTF-8") == "list" }.map { URLDecoder.decode(it.getOrElse(1) { "" }, "UTF-8") }
                    require(ids.size == 1 && Regex("^[A-Za-z0-9_-]{10,100}$").matches(ids[0])) { "Invalid playlist ID." }
                    val id = ids[0]; require(seen.add(id)) { "This playlist is already saved." }
                    fun text(key: String, required: Boolean): String {
                        require(item.opt(key) is String) { "Invalid text." }
                        val value = item.getString(key).trim()
                        require((!required || value.isNotEmpty()) && value.toByteArray(Charsets.UTF_8).size <= 240 && !Regex("[\\x00-\\x1f\\x7f<>]").containsMatchIn(value)) { "Use plain text within the field limits." }
                        return value
                    }
                    val category = item.getString("category")
                    require(category in listOf("Anime", "Donghua") && item.opt("enabled") is Boolean) { "Invalid category or enabled state." }
                    clean.put(JSONObject().put("id", id).put("url", "https://www.youtube.com/playlist?list=$id").put("title", text("title", true)).put("source", text("source", false)).put("category", category).put("enabled", item.getBoolean("enabled")))
                }
                val next = JSONObject().put("revision", current.getInt("revision") + 1).put("playlists", clean)
                if (!prefs.edit().putString("configuration", next.toString()).commit()) return error(NanoHTTPD.Response.Status.INTERNAL_ERROR, "Unable to save playlists.")
                response(NanoHTTPD.Response.Status.OK, next)
            } else response(NanoHTTPD.Response.Status.OK, current)
        } catch (e: Exception) {
            error(NanoHTTPD.Response.Status.BAD_REQUEST, "Invalid playlist configuration. Check URL and field limits; existing configuration was not replaced.")
        }
    }
}
