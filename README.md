node-red-contrib-nfc
====================

CLEANING UP AND UPDATING TO BRING IN LINE WITH ORIGINAL NODE-NFC REPO

Depends on a modified version of the nfc npm node found here:

https://github.com/hardillb/node-nfc

And ndef npm

Run the following to install:

npm install ndef https://github.com/hardillb/node-nfc

Should work on Linux and possibly Mac

On Linux you may need to remove a the kernel based NFC driver e.g.

modprobe -r pn533

The actual module may vary depending on your NFC hardware