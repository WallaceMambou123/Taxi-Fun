import 'package:flutter/material.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import 'package:taxifun_core/taxifun_core.dart';
import 'package:taxifun_core/storybook/models.dart';

// dictionnaire des chapitres de la storybook
final Map<String, Chapter> storyChapters = {
  // chapitre TaxiButton
  "TaxiButton": Chapter(
    title: "TaxiButton",
    icon: Icons.ads_click,
    filePath: "lib/src/widgets/taxifun_button.dart",
    widget: TaxiButton(title: 'Click Me', onPressed: () {}),
    description:
        "Bouton principal utilisé pour les actions de validation dans l'application.",
  ),

  // chapitre CustomAuthFooter
  "CustomAuthFooter": Chapter(
    title: "CustomAuthFooter",
    icon: Icons.text_snippet,
    widget: CustomAuthFooter(
      label: "Vous n'avez pas de compte ?",
      actionText: "Inscrivez-vous",
      onPressed: () {},
      actionStyle: const TextStyle(
        color: AppTheme.primaryOrange,
        fontWeight: FontWeight.bold,
      ),
    ),
    filePath: "lib/src/widgets/custom_auth_footer.dart",
    description:
        "Pied de page personnalisé pour les écrans d'authentification avec texte cliquable.",
  ),

  // chapitre OptInputField
  "OtpInputField": Chapter(
      title: "OtpInputField",
      icon: Icons.pin,
      widget: OtpInputField(controller: TextEditingController()),
      filePath: "lib/src/widgets/Otp_input_field.dart",
      description:
          "Champs de saisie de code pin, adapter pour la saisie de code OTP (One-Time-Password)\n"
          "Exemple:\n"
          "OptInputField(TextEditingController(), )"),

  // chapitre OtpResendTimer
  "OtpResendTimer": Chapter(
      title: "OtpResendTimer",
      icon: Icons.repeat,
      widget: OtpResendTimer(
        onResend: () {},
      ),
      filePath: "lib/src/widgets/otp_resend_timer.dart",
      description:
          "Boutons dynamique, adapter pour le controle d'envoie de code OTP (One-Time-Password)\n"
          "Ce dernier attend un certain nombre de temps avant d'executer la fonction onRend\n"
          "Exemple:\n"
          "OtpResendTimer(onResend: () { print('OTP Revoie avec succes')},)"),

  // chapitre TaxiFunPhoneInput
  "TaxiFunPhoneInput": Chapter(
    title: "TaxiFunPhoneInput",
    icon: Icons.phone,
    widget: TaxiFunPhoneInput(
      onInputChanged: (PhoneNumber number) {},
      initialValue: PhoneNumber(isoCode: 'CM'),
    ),
    filePath: "lib/src/widgets/taxifun_phone_input.dart",
    description:
        "Champ de saisie de numéro de téléphone international avec sélection de pays.\n"
        "Exemple:\n"
        "TaxiFunPhoneInput(onInputChanged: (PhoneNumber number) { print(number); }, initialValue: PhoneNumber(isoCode: 'CM'),)",
  ),

  // chapitre BackgroundWrapper
  "BackgroundWrapper": Chapter(
    title: "BackgroundWrapper",
    icon: Icons.wallpaper,
    widget: BackgroundWrapper(
      child: Center(
        child: Text("Contenu avec fond personnalisé"),
      ),
    ),
    filePath: "lib/src/widgets/background_wrapper.dart",
    description:
        "Conteneur avec un fond dégradé ou design spécifique à TaxiFun.\n"
        "Applique le style de fond aux écrans principales.\n"
        "Exemple:\n"
        "BackgroundWrapper(child: YourWidget())",
  ),

  // chapitre CustomBottomNav
  "CustomBottomNav": Chapter(
    title: "CustomBottomNav",
    icon: Icons.navigation,
    widget: CustomBottomNav(
      currentIndex: 1,
      onTap: (int p1) {},
      orangeColor: AppTheme.primaryOrange,
    ),
    filePath: "lib/src/widgets/custom_bottom_nav.dart",
    description:
        "Barre de navigation inférieure personnalisée avec style TaxiFun.\n"
        "Utilisé dans les écrans principaux pour naviguer entre sections.\n"
        "Exemple:\n"
        "CustomBottomNav(selectedIndex: 0, onItemTapped: (index) { print(index); })",
  ),

  // chapitre AppTheme
  "AppTheme": Chapter(
    title: "AppTheme",
    icon: Icons.palette,
    widget: Container(
      color: AppTheme.primaryOrange,
      child: const Center(
        child: Text(
          "Couleur Primaire: #EC8C01",
          style: TextStyle(color: Colors.white, fontSize: 18),
        ),
      ),
    ),
    filePath: "lib/src/theme/app_theme.dart",
    description: "Thème principal de l'application TaxiFun.\n"
        "Définit les couleurs, polices et configuration Material Design 3.\n"
        "Couleur primaire: Orange (#EC8C01)\n"
        "Police: Poppins\n"
        "Exemple:\n"
        "MaterialApp(theme: AppTheme.lightTheme, ...)",
  ),

  // chapitre ApiClient
  "ApiClient": Chapter(
    title: "ApiClient",
    icon: Icons.api,
    widget: Container(
      color: Colors.grey[200],
      child: const Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.cloud_download, size: 48, color: Colors.blue),
            SizedBox(height: 16),
            Text(
              "ApiClient - Client HTTP",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text(
              "Utilisé pour les requêtes API avec authentification JWT",
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      ),
    ),
    filePath: "lib/src/network/api_client.dart",
    description: "Client HTTP pour communiquer avec l'API TaxiFun.\n"
        "Utilise Dio avec gestion automatique de l'authentification JWT.\n"
        "Fonctionnalités:\n"
        "- Authentification par token JWT\n"
        "- Stockage sécurisé des tokens\n"
        "- Intercepteurs pour headers d'authentification\n"
        "- Configuration de base (base URL, content-type)\n"
        "Exemple:\n"
        "final apiClient = ApiClient();\n"
        "final response = await apiClient.dio.get('/endpoint');",
  ),

  // chapitre PhoneFormatter
  "PhoneFormatter": Chapter(
    title: "PhoneFormatter",
    icon: Icons.format_shapes,
    widget: Container(
      color: Colors.grey[200],
      child: const Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.phone_in_talk, size: 48, color: Colors.green),
            SizedBox(height: 16),
            Text(
              "PhoneFormatter",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text(
              "Utilitaire de formatage de numéros de téléphone",
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            SizedBox(height: 16),
            Text(
              "Exemple: '691234567' → '+237691234567'",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic),
            ),
          ],
        ),
      ),
    ),
    filePath: "lib/src/utils/phone_formatter.dart",
    description: "Utilitaires de formatage de numéro de téléphone.\n"
        "Formate et normalise les numéros de téléphone camerounais.\n"
        "Supporte les numéros camerounais avec codes pays (+237).\n"
        "Exemple:\n"
        "final formatted = PhoneFormatter.format('691234567');\n"
        "// Résultat: '+237691234567'",
  ),
};
