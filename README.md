# STRATUS Model Name Paste v0.2.1

This test extension restores normal clipboard paste only in the STRATUS model
deletion confirmation field shown inside the **Verify Model Name** dialog. It
also has an optional setting that automatically checks the acknowledgment box
in the first **Delete Model** warning and clicks **Next**.

It never clicks the final **Delete Model and Data** button, bypasses name
matching, or modifies other STRATUS text fields.

## Option

Click the extension's toolbar icon and enable **Automatically acknowledge the
first warning**. The option is off by default and is remembered by the browser.

## Install in Chrome

1. Extract `STRATUS_Model_Name_Paste_v0.2.1.zip` to a permanent folder.
2. Open `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the extracted `stratus-model-name-paste` folder.
6. Refresh the open STRATUS tab.

## Install in Edge

1. Extract `STRATUS_Model_Name_Paste_v0.2.1.zip` to a permanent folder.
2. Open `edge://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the extracted `stratus-model-name-paste` folder.
6. Refresh the open STRATUS tab.

## Safe test

1. Open STRATUS and start the model-deletion flow.
2. If automatic warning acknowledgment is enabled, confirm that the first
   warning advances to **Verify Model Name**. Otherwise, check the box and click
   **Next** manually.
3. Copy the model name shown in the second dialog.
4. Click the confirmation field and press `Ctrl+V`.
5. Confirm that the full model name appears and the delete button becomes
   enabled.
6. Click **Back** or close the dialog. You do not need to complete the deletion.

If the text appears but the button stays disabled, report that exact behavior
before trying to delete anything.
