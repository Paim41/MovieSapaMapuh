package com.pencarimovie.server

import android.content.Context
import android.text.SpannableString
import android.text.Spanned
import android.text.style.ImageSpan
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat

/** Retain the original accessible text while presenting its warning as a vector. */
object NativeIcons {
    fun warnings(context: Context, text: CharSequence): CharSequence {
        val value = SpannableString(text)
        val marker = "⚠️"
        var start = text.indexOf(marker)
        while (start >= 0) {
            ContextCompat.getDrawable(context, R.drawable.ic_noir_warning)?.mutate()?.let { icon ->
                val size = (18 * context.resources.displayMetrics.density).toInt()
                icon.setBounds(0, 0, size, size)
                value.setSpan(ImageSpan(icon, ImageSpan.ALIGN_BASELINE), start, start + marker.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
            }
            start = text.indexOf(marker, start + marker.length)
        }
        return value
    }
    fun apply(root: View) {
        if (root is TextView && root.text.contains("⚠️")) root.text = warnings(root.context, root.text)
        if (root is ViewGroup) for (i in 0 until root.childCount) apply(root.getChildAt(i))
    }
}
