import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/menu_item_model.dart';
import '../../providers/menu_provider.dart';
import '../../widgets/custom_button.dart';

class AddEditMenuItemScreen extends ConsumerStatefulWidget {
  final MenuItemModel? existingItem;

  const AddEditMenuItemScreen({super.key, this.existingItem});

  @override
  ConsumerState<AddEditMenuItemScreen> createState() => _AddEditMenuItemScreenState();
}

class _AddEditMenuItemScreenState extends ConsumerState<AddEditMenuItemScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _descController;
  late TextEditingController _priceController;
  late TextEditingController _discountPriceController;
  late TextEditingController _prepTimeController;
  late TextEditingController _imageController;

  String _category = 'Biryani';
  bool _isVeg = false;
  bool _isAvailable = true;
  bool _isBestSeller = false;

  final List<String> _categories = [
    'Biryani',
    'Starters',
    'Main Course',
    'Rice',
    'Breads',
    'Desserts',
    'Beverages',
  ];

  @override
  void initState() {
    super.initState();
    final item = widget.existingItem;
    _nameController = TextEditingController(text: item?.name ?? '');
    _descController = TextEditingController(text: item?.description ?? '');
    _priceController = TextEditingController(text: item != null ? item.price.toStringAsFixed(0) : '');
    _discountPriceController = TextEditingController(text: item?.discountPrice != null ? item!.discountPrice!.toStringAsFixed(0) : '');
    _prepTimeController = TextEditingController(text: item?.preparationTimeMinutes.toString() ?? '15');
    _imageController = TextEditingController(
        text: item?.imageUrl ?? 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80');

    if (item != null) {
      _category = item.category;
      _isVeg = item.isVeg;
      _isAvailable = item.isAvailable;
      _isBestSeller = item.isBestSeller;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    _priceController.dispose();
    _discountPriceController.dispose();
    _prepTimeController.dispose();
    _imageController.dispose();
    super.dispose();
  }

  void _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    final name = _nameController.text.trim();
    final desc = _descController.text.trim();
    final price = double.tryParse(_priceController.text.trim()) ?? 0.0;
    final discountPrice = double.tryParse(_discountPriceController.text.trim());
    final prepTime = int.tryParse(_prepTimeController.text.trim()) ?? 15;
    final imageUrl = _imageController.text.trim().isNotEmpty
        ? _imageController.text.trim()
        : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80';

    final newItem = MenuItemModel(
      id: widget.existingItem?.id ?? 'item_${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      description: desc,
      category: _category,
      price: price,
      discountPrice: discountPrice,
      imageUrl: imageUrl,
      isVeg: _isVeg,
      isAvailable: _isAvailable,
      preparationTimeMinutes: prepTime,
      isBestSeller: _isBestSeller,
      rating: widget.existingItem?.rating ?? 4.8,
      votes: widget.existingItem?.votes ?? 1,
    );

    if (widget.existingItem != null) {
      await ref.read(menuProvider.notifier).updateItem(newItem);
    } else {
      await ref.read(menuProvider.notifier).addItem(newItem);
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(widget.existingItem != null ? 'Dish updated successfully!' : 'New dish added to menu!'),
          backgroundColor: AppColors.success,
        ),
      );
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.existingItem != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEdit ? 'Edit Dish' : 'Add New Dish', style: AppTypography.h3),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Dish Name
              const Text('Dish Title *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(hintText: 'e.g. Royal Hyderabadi Dum Biryani'),
                validator: (val) => val == null || val.trim().isEmpty ? 'Dish name is required' : null,
              ),
              const SizedBox(height: 16),

              // Category & Dietary
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Category', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _category,
                          items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _category = val);
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Food Type', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                _isVeg ? 'Veg' : 'Non-Veg',
                                style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  color: _isVeg ? AppColors.veg : AppColors.nonVeg,
                                ),
                              ),
                              Switch(
                                value: _isVeg,
                                activeColor: AppColors.veg,
                                inactiveThumbColor: AppColors.nonVeg,
                                onChanged: (val) => setState(() => _isVeg = val),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Pricing: Base price & Discount price
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Base Price (₹) *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _priceController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(hintText: '380'),
                          validator: (val) => val == null || val.trim().isEmpty ? 'Price is required' : null,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Discount Price (₹)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _discountPriceController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(hintText: '340 (optional)'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Prep Time & Image URL
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Prep Time (Mins)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _prepTimeController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(hintText: '15'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Bestseller Tag', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                _isBestSeller ? 'Featured' : 'Standard',
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
                              ),
                              Switch(
                                value: _isBestSeller,
                                activeColor: AppColors.primary,
                                onChanged: (val) => setState(() => _isBestSeller = val),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Image URL
              const Text('Image URL', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _imageController,
                decoration: const InputDecoration(hintText: 'https://images.unsplash.com/...'),
              ),
              const SizedBox(height: 16),

              // Description
              const Text('Description', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _descController,
                maxLines: 3,
                decoration: const InputDecoration(hintText: 'Describe ingredients, aroma, and serving portion...'),
              ),
              const SizedBox(height: 32),

              CustomButton(
                text: isEdit ? 'Save Changes' : 'Add Item to Menu',
                onPressed: _handleSave,
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
