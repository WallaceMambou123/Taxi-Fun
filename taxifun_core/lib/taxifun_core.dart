/// # TaxiFun Core Library
///
/// Bibliothèque centrale contenant les composants réutilisables, utilitaires
/// et configurations pour l'application TaxiFun.
///
/// Cette librairie exporte les widgets, utilitaires, thèmes et clients API
/// partagés entre les différentes applications (client, driver, admin).
library;

// ============================================================================
// NETWORK - Gestion des requêtes API
// ============================================================================

/// Client HTTP pour communiquer avec l'API TaxiFun
///
/// Utilise Dio pour les requêtes HTTP avec gestion automatique:
/// - Authentification par token JWT
/// - Stockage sécurisé des tokens (FlutterSecureStorage)
/// - Intercepteurs pour l'ajout des headers d'authentification
/// - Configuration de base (base URL, content-type)
///
/// Exemple d'utilisation:
/// ```dart
/// final apiClient = ApiClient();
/// final response = await apiClient.dio.get('/endpoint');
/// ```
export 'src/network/api_client.dart';

// ============================================================================
// WIDGETS - Composants UI réutilisables
// ============================================================================

/// Bouton primaire personnalisé pour TaxiFun
///
/// Bouton ElevatedButton avec le style orange primaire de TaxiFun.
/// Supporte l'état de chargement avec un spinner circulaire.
///
/// Propriétés:
/// - `title`: Texte du bouton
/// - `onPressed`: Callback au clic
/// - `isLoading`: Affiche un loader et désactive le bouton
///
/// Exemple:
/// ```dart
/// TaxiButton(
///   title: 'Connexion',
///   onPressed: () => handleLogin(),
///   isLoading: isLoading,
/// )
/// ```
export 'src/widgets/taxifun_button.dart';

/// Dialogue de succès
///
/// Composant pour afficher une confirmation/succès à l'utilisateur.
export 'src/widgets/SuccessDialog.dart';

/// Barre de navigation inférieure personnalisée
///
/// Widget pour la navigation inférieure avec style TaxiFun.
/// Utilisé dans les écrans principaux pour naviguer entre sections.
export 'src/widgets/custom_bottom_nav.dart';

/// Wrapper avec fond personnalisé
///
/// Conteneur avec un fond dégradé ou design spécifique à TaxiFun.
/// Applique le style de fond aux écrans principales.
export 'src/widgets/background_wrapper.dart';

/// Pied de page personnalisé pour l'authentification
///
/// Widget affichant des informations ou liens supplémentaires
/// au bas des écrans de connexion/inscription.
export 'src/widgets/custom_auth_footer.dart';

/// Champ de saisie OTP (One-Time Password)
///
/// Widget pour saisir un code à 4 ou 6 chiffres.
/// Avec support du copier-coller et navigation automatique.
export 'src/widgets/otp_input_field.dart';

/// Minuteur de renvoi OTP
///
/// Widget affichant un décompte avant de pouvoir renvoyer le code.
/// Gère le délai de cooldown et la réactivation du bouton de renvoi.
export 'src/widgets/otp_resend_timer.dart';

/// Champ de saisie téléphone personnalisé
///
/// Input pour numéro de téléphone avec:
/// - Validation du format
/// - Mise en forme automatique
/// - Drapeau du pays
/// - Support des codes pays
export 'src/widgets/taxifun_phone_input.dart';

// ============================================================================
// UTILS - Fonctions utilitaires
// ============================================================================

/// Utilitaires de formatage de numéro de téléphone
///
/// Classe utilitaire pour formater et normaliser les numéros de téléphone.
/// Supporte les numéros camerounais avec codes pays (+237).
///
/// Exemple:
/// ```dart
/// final formatted = PhoneFormatter.format('691234567');
/// // Résultat: '+237691234567'
/// ```
export 'src/utils/phone_formatter.dart';

// ============================================================================
// THEME - Configuration du thème visuel
// ============================================================================

/// Thème principal de l'application TaxiFun
///
/// Définit:
/// - Couleurs principales (orange primaire #EC8C01)
/// - Polices (Poppins)
/// - Configuration Material Design 3
/// - Palette de couleurs cohérente
///
/// Utilisation:
/// ```dart
/// MaterialApp(
///   theme: AppTheme.lightTheme,
///   // ...
/// )
/// ```
export 'src/theme/app_theme.dart';
