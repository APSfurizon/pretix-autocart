import logging
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _
from django.core.handlers.wsgi import WSGIRequest
from collections import OrderedDict
from django import forms

from pretix.base.signals import (
	register_global_settings
)
from pretix.presale.signals import (
	global_html_head
)

logger = logging.getLogger(__name__)

@receiver(global_html_head, dispatch_uid="autocart_global_head")
def globalHead(**kwargs):
	req : WSGIRequest = kwargs["request"]
	if "/checkout/" in req.get_full_path():
		logger.info("Injecting js")
		return '''
<script src="/static/pretix_autocart/crypto-js/crypto-js.min.js"></script>
<script src="/static/pretix_autocart/jsencrypt/jsencrypt.min.js"></script>
<script type="text/javascript" src="/static/pretix_autocart/script.js"></script>
'''.strip()
	else: 
		return ""

@receiver(register_global_settings, dispatch_uid="autocart_global_setting")
def globalSettings(**kwargs):
	return OrderedDict([
			('feature_autocart_public_key', forms.CharField(
					widget=forms.widgets.Textarea,
					label=_("Auto-cart&questions RSA pubkey"),
					help_text=_('Auto-cart uses a private/public keypair to protect customers from attacks aimed in remotely adding elements to a cart or remotely modifying questions\' answers'),
			))
		])