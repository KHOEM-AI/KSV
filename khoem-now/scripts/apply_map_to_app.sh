#!/bin/bash
# ដំណើរការនៅ ~/KSV/khoem-now — បន្ថែម MapView ចូល App.tsx (2 ចំណុចប៉ុណ្ណោះ, មិនប៉ះអ្វីផ្សេង)
set -e

FILE="src/App.tsx"

# 1. បន្ថែម import MapView ក្រោម import GatewayView
sed -i "/import { GatewayView } from '@\/views\/GatewayView';/a import { MapView } from '@/views/MapView';" "$FILE"

# 2. បន្ថែម map: MapView, ក្រោម gateway: GatewayView,
sed -i "/gateway: GatewayView,/a\\  map: MapView," "$FILE"

echo "=== ត្រួតពិនិត្យលទ្ធផល ==="
grep -n "MapView" "$FILE"
