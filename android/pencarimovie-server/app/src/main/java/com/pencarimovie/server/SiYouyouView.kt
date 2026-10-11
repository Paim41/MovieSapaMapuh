package com.pencarimovie.server

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Rect
import org.json.JSONObject
import android.os.Handler
import android.os.Looper
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import androidx.appcompat.app.AlertDialog
import java.util.concurrent.Executors
import kotlin.math.abs
import kotlin.math.min

/** A bounded native companion: never a system overlay and never on top of server controls. */
class SiYouyouView @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null) : View(context, attrs) {
    private val prefs = context.getSharedPreferences("moviesapamapuh.pet", Context.MODE_PRIVATE)
    private val handler = Handler(Looper.getMainLooper())
    private var decoder = Executors.newSingleThreadExecutor()
    private val cache = LinkedHashMap<String, Bitmap>()
    private val pending = HashSet<String>()
    private val paint = Paint().apply { isFilterBitmap = false }
    private var active = false
    private var state = "idle"
    private var frame = 0
    private var ticks = 0
    private val anchors = context.assets.open("web/assets/si-youyou/anchors.json").bufferedReader().use { JSONObject(it.readText()) }
    private var lastFrame: Pair<String, Bitmap>? = null
    private var dragStartX = 0f
    private var dragStartY = 0f
    private var blinkAt = 40 + (Math.random()*40).toInt()
    private var idleCycles = 0
    private var xFraction = prefs.getFloat("x", .5f)
    private var yFraction = prefs.getFloat("y", .8f)
    private var downX = 0f
    private var downY = 0f
    private var dragging = false
    private var touchHeld = false
    private var menuOpened = false
    private var previousServerState = ""
    private val idle = "idle/si_youyou_idle_front.png"
    private val frames = mapOf(
        "idle" to listOf(idle), "blink" to listOf("blink/si_youyou_blink_front.png"),
        "walk" to (1..4).map { "walk/si_youyou_walk_left_0$it.png" },
        "sit" to listOf("sit/si_youyou_sit_front.png"), "sleep" to listOf("sleep/si_youyou_sleep_front.png"),
        "jump" to listOf("jump/si_youyou_jump_crouch.png", "jump/si_youyou_jump_airborne.png", "jump/si_youyou_jump_landing.png"),
        "happy" to listOf("reactions/si_youyou_happy.png"), "wave" to listOf("reactions/si_youyou_wave.png"),
        "dragged" to listOf(idle), "hidden" to emptyList()
    )
    private fun enabled() = prefs.getBoolean("enabled", true)
    private fun moving() = prefs.getBoolean("animations", true) && !prefs.getBoolean("reduced", false) && android.provider.Settings.Global.getFloat(context.contentResolver, android.provider.Settings.Global.ANIMATOR_DURATION_SCALE, 1f) != 0f
    private fun transition(next: String) { state = next; frame = 0; ticks = 0; if(next=="idle") blinkAt=40+(Math.random()*40).toInt(); invalidate() }
    private val tick = object : Runnable {
        override fun run() {
            if (!active || !hasWindowFocus() || !isShown || !enabled() || !moving()) return
            if (!getGlobalVisibleRect(android.graphics.Rect())) { handler.postDelayed(this, 1000); return }
            if (!touchHeld) {
                ticks++
                when (state) {
                    "idle" -> if (ticks > blinkAt) transition("blink")
                    "blink" -> if (ticks > 2) { idleCycles++; transition(if(idleCycles >= 4) "sit" else if(idleCycles==2) "walk" else "idle") }
                    "walk" -> if (ticks > 12) transition("idle")
                    "sit" -> if (ticks > 90) transition("sleep")
                    "sleep" -> if (ticks > 180) { idleCycles=0; transition("idle") }
                    "jump", "happy", "wave" -> if (ticks > 12) transition("idle")
                }
                frame++
                invalidate()
            }
            handler.postDelayed(this, 100)
        }
    }
    init {
        isClickable = true; isFocusable = true
        contentDescription = "Si Youyou. Tap to wave; long press for pet settings."
        setOnClickListener { if(enabled()) transition(if(moving()) "wave" else "idle") else showSettings() }
        setOnLongClickListener { showSettings(); true }
    }
    fun setActive(value: Boolean) {
        active = value
        handler.removeCallbacks(tick)
        if (value && enabled() && moving()) handler.post(tick)
    }
    fun serverState(value: String) {
        if (value == previousServerState) return
        previousServerState = value
        if (!enabled()) return
        transition(if (!moving()) "idle" else when(value) { "running" -> "jump"; "error" -> "sit"; else -> "idle" })
    }
    private fun bitmap(name: String): Bitmap? {
        cache[name]?.let { return it }
        if (!decoder.isShutdown && pending.add(name)) decoder.execute {
            val loaded = try {
                context.assets.open("web/assets/si-youyou/sprites/$name").use {
                    BitmapFactory.decodeStream(it, null, BitmapFactory.Options().apply { inSampleSize = 4 })
                }
            } catch (_: Exception) { null }
            handler.post {
                pending.remove(name)
                if (loaded != null && isAttachedToWindow) {
                    if (cache.size >= 8) cache.remove(cache.keys.first())
                    cache[name] = loaded; invalidate()
                }
            }
        }
        return null
    }
    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (!enabled()) return
        val group = frames[if (moving()) state else "idle"] ?: return
        if (group.isEmpty()) return
        val index = if(state == "jump") min(ticks / 4, group.size-1) else frame % group.size
        val name = group[index]
        bitmap(name)?.let { lastFrame = name to it }
        bitmap(group[(index+1)%group.size]) // preload without replacing an unready pose with idle
        val (shown, b) = lastFrame ?: return
        val data=anchors.getJSONObject(shown); val bounds=data.getJSONArray("bounds"); val size=data.getJSONArray("size")
        val sx=b.width.toFloat()/size.getInt(0); val sy=b.height.toFloat()/size.getInt(1)
        val source=Rect((bounds.getInt(0)*sx).toInt(),(bounds.getInt(1)*sy).toInt(),(bounds.getInt(2)*sx).toInt(),(bounds.getInt(3)*sy).toInt())
        val density=resources.displayMetrics.density
        val box=min(112*density,width.toFloat()); val h=min(84*density,height.toFloat()-8*density)
        val w=h*(bounds.getInt(2)-bounds.getInt(0))/(bounds.getInt(3)-bounds.getInt(1))
        val drift=if(state=="walk" && moving()) kotlin.math.sin(min(ticks/12f,1f)*Math.PI).toFloat()*8*density*(if(xFraction<.5f) 1 else -1) else 0f
        val left=((width-box).coerceAtLeast(0f)*xFraction+(box-w)/2+drift).coerceIn(0f,(width-w).coerceAtLeast(0f))
        val bottom=h+(height-h-8*density).coerceAtLeast(0f)*yFraction
        canvas.drawBitmap(b,source,RectF(left,bottom-h,left+w,bottom),paint)
    }
    private val hold = Runnable { if(touchHeld && !dragging) { menuOpened=true; showSettings() } }
    override fun onTouchEvent(event: MotionEvent): Boolean {
        when(event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                touchHeld=true; dragging=false; menuOpened=false; downX=event.x; downY=event.y; dragStartX=xFraction; dragStartY=yFraction; idleCycles=0
                handler.postDelayed(hold,550); parent?.requestDisallowInterceptTouchEvent(true); return true
            }
            MotionEvent.ACTION_MOVE -> {
                if(abs(event.x-downX)+abs(event.y-downY)>12*resources.displayMetrics.density) {
                    dragging=true; handler.removeCallbacks(hold); state="dragged"
                    xFraction=(dragStartX+(event.x-downX)/(width-112*resources.displayMetrics.density).coerceAtLeast(1f)).coerceIn(0f,1f); yFraction=(dragStartY+(event.y-downY)/(height-92*resources.displayMetrics.density).coerceAtLeast(1f)).coerceIn(0f,1f); invalidate()
                }; return true
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                handler.removeCallbacks(hold); touchHeld=false; parent?.requestDisallowInterceptTouchEvent(false)
                if(dragging) { prefs.edit().putFloat("x",xFraction).putFloat("y",yFraction).apply(); transition("idle") }
                else if(event.actionMasked==MotionEvent.ACTION_UP && !menuOpened) performClick()
                return true
            }
        }
        return super.onTouchEvent(event)
    }
    override fun performClick(): Boolean { super.performClick(); return true }
    fun showSettings() {
        handler.removeCallbacks(tick)
        val keys=arrayOf("enabled","animations","reduced")
        val labels=arrayOf("Enable Pet","Enable Animations","Reduced Motion / Performance Mode")
        AlertDialog.Builder(context).setTitle("Si Youyou")
            .setMultiChoiceItems(labels,booleanArrayOf(enabled(),prefs.getBoolean("animations",true),prefs.getBoolean("reduced",false))) { _, i, checked ->
                prefs.edit().putBoolean(keys[i],checked).apply(); transition(if(enabled()) "idle" else "hidden")
            }.setNeutralButton("Reset Pet Position") { _, _ ->
                xFraction=.5f; yFraction=.8f; prefs.edit().remove("x").remove("y").apply(); invalidate()
            }.setPositiveButton("Done",null).create().also { dialog ->
                dialog.setOnDismissListener { setActive(active) }; dialog.show()
            }
    }
    override fun onAttachedToWindow() { super.onAttachedToWindow(); if(decoder.isShutdown) decoder=Executors.newSingleThreadExecutor() }
    override fun onWindowFocusChanged(hasWindowFocus: Boolean) { super.onWindowFocusChanged(hasWindowFocus); handler.removeCallbacks(tick); if(hasWindowFocus && active && enabled() && moving()) handler.post(tick) }
    override fun onDetachedFromWindow() { setActive(false); handler.removeCallbacks(hold); decoder.shutdownNow(); cache.clear(); pending.clear(); lastFrame=null; super.onDetachedFromWindow() }
}
