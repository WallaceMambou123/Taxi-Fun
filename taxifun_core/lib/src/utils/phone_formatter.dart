class PhoneFormatter {
  static String format(String phone) {
    String p = phone.trim();
    if (p.startsWith('6') && p.length == 9) {
      return '+237$p';
    }
    if (!p.startsWith('+')) {
      return '+$p'; // Ajoute le + si l'utilisateur a mis 2376...
    }
    return p;
  }
}
