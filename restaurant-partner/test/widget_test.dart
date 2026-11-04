import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:feedo_partner/widgets/status_badge.dart';
import 'package:feedo_partner/widgets/stat_card.dart';
import 'package:feedo_partner/core/constants/order_status_constants.dart';
import 'package:feedo_partner/core/theme/app_colors.dart';

void main() {
  testWidgets('StatusBadge renders correct labels and styling', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Column(
            children: [
              StatusBadge(status: OrderStatusConstants.created),
              StatusBadge(status: OrderStatusConstants.preparing),
              StatusBadge(status: OrderStatusConstants.readyForPickup),
            ],
          ),
        ),
      ),
    );

    expect(find.text('NEW ORDER'), findsOneWidget);
    expect(find.text('PREPARING'), findsOneWidget);
    expect(find.text('FOOD READY'), findsOneWidget);
  });

  testWidgets('StatCard displays metrics and titles correctly', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: StatCard(
            title: "Today's Sales",
            value: '₹28,450',
            icon: Icons.currency_rupee_rounded,
            iconColor: AppColors.primary,
            trend: '+12.4%',
          ),
        ),
      ),
    );

    expect(find.text("Today's Sales"), findsOneWidget);
    expect(find.text('₹28,450'), findsOneWidget);
    expect(find.text('+12.4%'), findsOneWidget);
  });
}
