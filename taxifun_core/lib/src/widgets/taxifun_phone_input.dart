import 'package:flutter/material.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import 'package:taxifun_core/taxifun_core.dart';

class TaxiFunPhoneInput extends StatelessWidget {
  final Function(PhoneNumber) onInputChanged;
  final Function(bool)? onInputValidated; // <--- Ajouté ici
  final PhoneNumber? initialValue;
  final TextEditingController? controller;

  const TaxiFunPhoneInput({
    super.key,
    required this.onInputChanged,
    this.onInputValidated, // <--- Ajouté ici
    this.initialValue,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return InternationalPhoneNumberInput(
      onInputChanged: onInputChanged,
      onInputValidated: onInputValidated, // <--- On le passe au widget interne
      initialValue: initialValue ?? PhoneNumber(isoCode: 'CM'),
      textFieldController: controller,
      formatInput: true,
      autoValidateMode:
          AutovalidateMode.onUserInteraction, // Valide pendant la saisie
      selectorConfig: const SelectorConfig(
        selectorType: PhoneInputSelectorType.BOTTOM_SHEET,
        setSelectorButtonAsPrefixIcon: true,
        leadingPadding: 16,
      ),
      textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
      selectorTextStyle: const TextStyle(color: Colors.black87),
      inputDecoration: InputDecoration(
        hintText: '670 000 000',
        hintStyle: TextStyle(color: Colors.grey.withOpacity(0.5)),
        filled: true,
        fillColor: Colors.grey[50],
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppTheme.primaryOrange),
        ),
        // ... (le reste de ton style inchangé)
      ),
    );
  }
}
