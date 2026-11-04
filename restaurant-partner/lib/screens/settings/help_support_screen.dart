import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../widgets/custom_button.dart';

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Help & Partner Support', style: AppTypography.h3)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Contact Support Cards
            Row(
              children: [
                Expanded(
                  child: _buildContactCard(
                    context,
                    icon: Icons.phone_in_talk_rounded,
                    title: 'Call Helpline',
                    subtitle: '1800-419-FEEDO',
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildContactCard(
                    context,
                    icon: Icons.chat_rounded,
                    title: 'Live Chat',
                    subtitle: 'Avg reply 2 mins',
                    color: AppColors.success,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            const Text('Frequently Asked Questions', style: AppTypography.h3),
            const SizedBox(height: 12),
            Card(
              child: Column(
                children: [
                  ExpansionTile(
                    title: const Text('How do weekly settlements work?', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    children: const [
                      Padding(
                        padding: EdgeInsets.fromLTRB(16, 0, 16, 16),
                        child: Text(
                          'Settlements for orders delivered from Monday to Sunday are reconciled and automatically deposited to your registered bank account every Wednesday.',
                          style: AppTypography.caption,
                        ),
                      ),
                    ],
                  ),
                  const Divider(),
                  ExpansionTile(
                    title: const Text('Why is a 4-digit pickup code required for handoff?', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    children: const [
                      Padding(
                        padding: EdgeInsets.fromLTRB(16, 0, 16, 16),
                        child: Text(
                          'The 4-digit pickup code ensures the order is safely handed over only to the authenticated assigned delivery partner, preventing food mixups or theft.',
                          style: AppTypography.caption,
                        ),
                      ),
                    ],
                  ),
                  const Divider(),
                  ExpansionTile(
                    title: const Text('How can I edit my menu dish pricing?', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    children: const [
                      Padding(
                        padding: EdgeInsets.fromLTRB(16, 0, 16, 16),
                        child: Text(
                          'Navigate to the MENU tab, tap the three dots on any dish card, and click Edit Item to modify prices, discount tags, or preparation times.',
                          style: AppTypography.caption,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text('Submit a Support Ticket', style: AppTypography.h3),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    const TextField(
                      decoration: InputDecoration(
                        labelText: 'Issue Subject',
                        hintText: 'e.g. Order reconciliation or rider delayed',
                      ),
                    ),
                    const SizedBox(height: 12),
                    const TextField(
                      maxLines: 3,
                      decoration: InputDecoration(
                        labelText: 'Detailed Description',
                        hintText: 'Describe the issue or order ID...',
                      ),
                    ),
                    const SizedBox(height: 16),
                    CustomButton(
                      text: 'Submit Support Ticket',
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Support ticket #TK9482 created! An agent will call you shortly.'),
                            backgroundColor: AppColors.success,
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildContactCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 10),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
          const SizedBox(height: 2),
          Text(subtitle, style: AppTypography.caption),
        ],
      ),
    );
  }
}
