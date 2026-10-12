        // Email links use the user's email app; no account or permission is required here.
        if (scheme == "mailto") {
            try {
                startActivity(Intent(Intent.ACTION_SENDTO, uri))
            } catch (e: Exception) {
                Toast.makeText(this, "No email app available to open this link", Toast.LENGTH_SHORT).show()
            }
            return true
        }

