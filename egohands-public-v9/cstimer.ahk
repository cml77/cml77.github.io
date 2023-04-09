#NoEnv ; Recommended for performance and compatibility with future AutoHotkey releases.
#SingleInstance force ; Only allow one instance of the script to run.
SendMode Input ; Recommended for new scripts due to its superior speed and reliability.

; Hotkey to trigger the script.
^a::
  ; Save the current clipboard contents to a variable.
  clipboardContents := Clipboard
  
  ; Find the first open window with the title containing "Browser Title" and activate it.
  WinActivate, Roboflow Demo
  
  ; Wait for the window to become active before pasting.
  WinWaitActive, Roboflow Demo

  ;Sleep 300

  ; Paste the saved clipboard contents into the active window.
  ;Send %clipboardContents%
  ;SendInput {Raw}%clipboardContents%
  ;Clipboard := Clipboard
  Send ^v
  Send {Alt Down}{Tab}{Alt Up}

return
