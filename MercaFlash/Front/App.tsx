import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, Modal, Pressable, RefreshControl, SafeAreaView,
  ScrollView, StyleSheet, Text, TextInput, View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { api } from "./src/services/api";
import { Empty, Title } from "./src/components/ui";
import { OrderCard } from "./src/components/OrderCard";
import { AdminPanel } from "./src/screens/admin/AdminPanel";
import { money } from "./src/utils/format";
import type { Cart, Order, Product, Sede } from "./src/types";

type ViewName = "catalogo" | "carrito" | "pedidos" | "panel";

export default function App() {
  const [view, setView] = useState<ViewName>("catalogo");
  const [products, setProducts] = useState<Product[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [filter, setFilter] = useState("Todos");
  const [cart, setCart] = useState<Cart>({});
  const [codes, setCodes] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staffToken, setStaffToken] = useState<string | null>(null);
  const [pinModal, setPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedSede, setSelectedSede] = useState<number | null>(null);

  const loadCatalog = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([
        api<any[]>("/productos"), api<any[]>("/sedes")
      ]);
      const mapped = p.map(x => ({
        id: Number(x.id), nombre: x.name, categoria: x.cat,
        precio: Number(x.price), icono: x.icon || "🛒", stock: Number(x.cantidad)
      }));
      const mappedSedes = s.map(x => ({ id: Number(x.id_sede), nombre: x.nombre }));
      setProducts(mapped);
      setSedes(mappedSedes);
      setSelectedSede(prev => prev ?? mappedSedes[0]?.id ?? null);
    } catch (e: any) { Alert.alert("Error de conexión", e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadCatalog(); }, [loadCatalog]);

  const categories = useMemo(() => ["Todos", ...Array.from(new Set(products.map(p => p.categoria)))], [products]);
  const visibleProducts = filter === "Todos" ? products : products.filter(p => p.categoria === filter);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartRows = products.filter(p => (cart[p.id] || 0) > 0);
  const total = cartRows.reduce((sum, p) => sum + p.precio * cart[p.id], 0);

  const add = (id: number) => setCart(c => ({ ...c, [id]: Math.min((c[id] || 0) + 1, 99) }));
  const changeQty = (id: number, delta: number) => setCart(c => {
    const next = { ...c }; const q = (next[id] || 0) + delta;
    if (q <= 0) delete next[id]; else next[id] = Math.min(q, 99); return next;
  });

  const checkout = async () => {
    if (!selectedSede || cartRows.length === 0) return;
    setCheckoutLoading(true);
    try {
      const order = await api<Order>("/tienda/pedidos", {
        method: "POST",
        body: { sedeId: selectedSede, items: cartRows.map(p => ({ productoId: p.id, cantidad: cart[p.id] })) }
      });
      setCodes(c => [order.codigo, ...c]); setCart({});
      Alert.alert("¡Pedido confirmado!", `Código: ${order.codigo}\nRecoge en: ${order.sede}\nTotal: ${money(order.total)}`);
      setView("pedidos");
      setTimeout(loadClientOrders, 50);
    } catch (e: any) { Alert.alert("No se pudo crear el pedido", e.message); }
    finally { setCheckoutLoading(false); }
  };

  const loadClientOrders = useCallback(async () => {
    if (!codes.length) { setOrders([]); return; }
    try { setOrders(await api<Order[]>(`/tienda/pedidos?codigos=${encodeURIComponent(codes.join(","))}`)); }
    catch (e: any) { Alert.alert("Error", e.message); }
  }, [codes]);
  useEffect(() => { if (view === "pedidos") loadClientOrders(); }, [view, loadClientOrders]);

  const staffLogin = async () => {
    try {
      const result = await api<{ token: string }>("/personal/login", { method: "POST", body: { pin: pin.trim() } });
      setStaffToken(result.token); setPin(""); setPinModal(false); setView("panel");
    } catch (e: any) { Alert.alert("Acceso denegado", e.message); }
  };
  const logoutStaff = useCallback(() => { setStaffToken(null); setView("catalogo"); }, []);

  const go = (name: ViewName) => {
    if (name === "panel" && !staffToken) { setPinModal(true); return; }
    setView(name);
  };

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large"/><Text style={styles.muted}>Cargando MercaFlash…</Text></SafeAreaView>;

  return <SafeAreaView style={styles.safe}>
    <StatusBar style="dark" />
    <View style={styles.header}>
      <Pressable onPress={() => go("catalogo")}><Text style={styles.brand}>MercaFlash</Text><Text style={styles.tagline}>Compra virtual · recoge en tienda</Text></Pressable>
    </View>

    <View style={styles.nav}>
      <NavButton label="Catálogo" active={view === "catalogo"} onPress={() => go("catalogo")} />
      <NavButton label={`Carrito (${cartCount})`} active={view === "carrito"} onPress={() => go("carrito")} />
      <NavButton label="Pedidos" active={view === "pedidos"} onPress={() => go("pedidos")} />
    </View>

    {view === "catalogo" && <FlatList
      data={visibleProducts} keyExtractor={p => String(p.id)} numColumns={2}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCatalog(); }} />}
      ListHeaderComponent={<View><Title title="Elige tus productos" subtitle="Compra desde el celular y recoge sin filas." />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {categories.map(c => <Pressable key={c} onPress={() => setFilter(c)} style={[styles.chip, filter === c && styles.chipActive]}><Text style={filter === c ? styles.chipTextActive : styles.chipText}>{c}</Text></Pressable>)}
        </ScrollView></View>}
      contentContainerStyle={styles.content} columnWrapperStyle={styles.columns}
      renderItem={({ item }) => <View style={styles.card}><Text style={styles.icon}>{item.icono}</Text><Text style={styles.category}>{item.categoria}</Text><Text style={styles.productName}>{item.nombre}</Text><Text style={styles.price}>{money(item.precio)}</Text><Text style={styles.stock}>Stock: {item.stock}</Text><Pressable disabled={item.stock <= 0} onPress={() => add(item.id)} style={[styles.primary, item.stock <= 0 && styles.disabled]}><Text style={styles.primaryText}>{item.stock <= 0 ? "Agotado" : "Agregar"}</Text></Pressable></View>}
    />}

    {view === "carrito" && <ScrollView contentContainerStyle={styles.content}><Title title="Tu carrito" subtitle="Revisa tu pedido antes de confirmarlo." />
      {!cartRows.length ? <Empty text="Tu carrito está vacío." /> : <>
        {cartRows.map(p => <View key={p.id} style={styles.cartRow}><Text style={styles.cartIcon}>{p.icono}</Text><View style={styles.grow}><Text style={styles.productName}>{p.nombre}</Text><Text style={styles.muted}>{money(p.precio)} c/u</Text></View><View style={styles.qty}><Pressable onPress={() => changeQty(p.id, -1)} style={styles.qtyBtn}><Text>−</Text></Pressable><Text style={styles.qtyText}>{cart[p.id]}</Text><Pressable onPress={() => changeQty(p.id, 1)} style={styles.qtyBtn}><Text>+</Text></Pressable></View></View>)}
        <View style={styles.summary}><Text style={styles.total}>Total: {money(total)}</Text><Text style={styles.label}>Punto de recogida</Text>
          <View style={styles.sedes}>{sedes.map(s => <Pressable key={s.id} onPress={() => setSelectedSede(s.id)} style={[styles.sede, selectedSede === s.id && styles.sedeActive]}><Text style={selectedSede === s.id ? styles.chipTextActive : styles.chipText}>{s.nombre}</Text></Pressable>)}</View>
          <Pressable disabled={checkoutLoading} onPress={checkout} style={styles.primary}><Text style={styles.primaryText}>{checkoutLoading ? "Procesando…" : "Confirmar y pagar"}</Text></Pressable>
        </View></>}
    </ScrollView>}

    {view === "pedidos" && <ScrollView contentContainerStyle={styles.content}><Title title="Mis pedidos" subtitle="Consulta el estado de tus compras de esta sesión." />
      {!orders.length ? <Empty text="Todavía no has hecho pedidos en esta sesión." /> : orders.map(o => <OrderCard key={o.codigo} order={o} />)}
    </ScrollView>}

    {view === "panel" && staffToken && <AdminPanel token={staffToken} onLogout={logoutStaff} />}

    {view !== "panel" && <Pressable onPress={() => go("panel")} style={styles.staff}><Text style={styles.staffText}>Acceso personal</Text></Pressable>}

    <Modal visible={pinModal} transparent animationType="fade" onRequestClose={() => setPinModal(false)}>
      <View style={styles.modalOverlay}><View style={styles.modalBox}><Text style={styles.modalTitle}>Acceso del personal</Text><Text style={styles.muted}>Ingresa el PIN configurado en el backend.</Text><TextInput value={pin} onChangeText={setPin} keyboardType="number-pad" secureTextEntry maxLength={6} placeholder="••••" style={styles.input}/><View style={styles.inline}><Pressable style={styles.secondary} onPress={() => setPinModal(false)}><Text>Cancelar</Text></Pressable><Pressable style={styles.primary} onPress={staffLogin}><Text style={styles.primaryText}>Entrar</Text></Pressable></View></View></View>
    </Modal>
  </SafeAreaView>;
}

function NavButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.navButton, active && styles.navActive]}><Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:"#F7F4EC"},center:{flex:1,alignItems:"center",justifyContent:"center",gap:12,backgroundColor:"#F7F4EC"},header:{paddingHorizontal:18,paddingTop:10,paddingBottom:12,backgroundColor:"#F7F4EC"},brand:{fontSize:29,fontWeight:"800",color:"#234A37"},tagline:{fontSize:12,color:"#6C756E",marginTop:2},nav:{flexDirection:"row",paddingHorizontal:12,paddingBottom:10,gap:7,borderBottomWidth:1,borderBottomColor:"#DDD8CD"},navButton:{flex:1,paddingVertical:10,borderRadius:12,alignItems:"center"},navActive:{backgroundColor:"#2F5D45"},navText:{fontSize:12,fontWeight:"700",color:"#465049"},navTextActive:{color:"white"},content:{padding:14,paddingBottom:100},muted:{color:"#6C756E"},filters:{gap:8,paddingBottom:14},chip:{paddingHorizontal:14,paddingVertical:9,borderRadius:20,borderWidth:1,borderColor:"#CFC9BD",backgroundColor:"#FFF"},chipActive:{backgroundColor:"#2F5D45",borderColor:"#2F5D45"},chipText:{color:"#3E4942",fontWeight:"600"},chipTextActive:{color:"#FFF",fontWeight:"700"},columns:{gap:10},card:{flex:1,backgroundColor:"#FFF",padding:13,borderRadius:16,marginBottom:10,borderWidth:1,borderColor:"#E4DED3",minHeight:230},icon:{fontSize:42,marginBottom:8},category:{fontSize:11,textTransform:"uppercase",color:"#788178",fontWeight:"700"},productName:{fontSize:15,fontWeight:"800",color:"#27372F",marginTop:4},price:{fontSize:18,fontWeight:"800",color:"#2F5D45",marginTop:8},stock:{fontSize:11,color:"#7A827C",marginBottom:10},primary:{backgroundColor:"#2F5D45",paddingHorizontal:14,paddingVertical:12,borderRadius:12,alignItems:"center",justifyContent:"center",marginTop:"auto"},primaryText:{color:"#FFF",fontWeight:"800"},disabled:{opacity:.45},cartRow:{flexDirection:"row",alignItems:"center",backgroundColor:"#FFF",padding:12,borderRadius:14,marginBottom:9,borderWidth:1,borderColor:"#E4DED3"},cartIcon:{fontSize:30,marginRight:10},grow:{flex:1},qty:{flexDirection:"row",alignItems:"center",gap:8},qtyBtn:{width:30,height:30,borderRadius:15,backgroundColor:"#EEEAE1",alignItems:"center",justifyContent:"center"},qtyText:{fontWeight:"800"},summary:{backgroundColor:"#FFF",padding:16,borderRadius:16,marginTop:8},total:{fontSize:21,fontWeight:"900",color:"#25362D",marginBottom:14},label:{fontWeight:"700",marginBottom:8,color:"#465049"},sedes:{gap:7,marginBottom:14},sede:{padding:11,borderRadius:10,borderWidth:1,borderColor:"#D8D2C6"},sedeActive:{backgroundColor:"#2F5D45",borderColor:"#2F5D45"},inline:{flexDirection:"row",gap:10,marginBottom:12},secondary:{flex:1,borderWidth:1,borderColor:"#CFC9BD",padding:12,borderRadius:12,alignItems:"center",backgroundColor:"#FFF"},staff:{position:"absolute",right:14,bottom:18,backgroundColor:"#252D29",paddingHorizontal:14,paddingVertical:10,borderRadius:20},staffText:{color:"#FFF",fontWeight:"700",fontSize:12},modalOverlay:{flex:1,backgroundColor:"rgba(0,0,0,.45)",alignItems:"center",justifyContent:"center",padding:22},modalBox:{width:"100%",maxWidth:420,backgroundColor:"#FFF",padding:20,borderRadius:18},modalTitle:{fontSize:21,fontWeight:"900",color:"#25362D",marginBottom:5},input:{borderWidth:1,borderColor:"#CFC9BD",borderRadius:12,padding:13,fontSize:18,marginVertical:16}
});
