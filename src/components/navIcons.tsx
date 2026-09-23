import { View, type ColorValue } from "react-native";

/** Drawn marks for the tab bar. Text labels were clipping on a phone's home-indicator inset. */
export function NavIcon({
  name,
  color,
}: {
  name: "home" | "league" | "playbook" | "rules";
  color: ColorValue;
}) {
  if (name === "home") return <Home color={color} />;
  if (name === "league") return <League color={color} />;
  if (name === "playbook") return <Playbook color={color} />;
  return <Rules color={color} />;
}

function Home({ color }: { color: ColorValue }) {
  return (
    <View style={{ width: 26, height: 26, alignItems: "center" }}>
      <View
        style={{
          marginTop: 2,
          width: 0,
          height: 0,
          borderLeftWidth: 11,
          borderRightWidth: 11,
          borderBottomWidth: 9,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: color,
        }}
      />
      <View
        style={{ width: 16, height: 11, backgroundColor: color, marginTop: -1 }}
      />
    </View>
  );
}

function League({ color }: { color: ColorValue }) {
  const dot = { width: 8, height: 8, borderRadius: 2, backgroundColor: color };
  return (
    <View
      style={{
        width: 26,
        height: 26,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        alignContent: "center",
        justifyContent: "center",
      }}
    >
      <View style={dot} />
      <View style={dot} />
      <View style={dot} />
      <View style={dot} />
    </View>
  );
}

function Playbook({ color }: { color: ColorValue }) {
  return (
    <View
      style={{
        width: 26,
        height: 26,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
      }}
    >
      <View
        style={{
          width: 11,
          height: 11,
          borderRadius: 6,
          borderWidth: 2.5,
          borderColor: color,
        }}
      />
      <View style={{ width: 12, height: 12 }}>
        <View
          style={{
            position: "absolute",
            left: 4.75,
            top: -0.5,
            width: 2.5,
            height: 13,
            borderRadius: 1,
            backgroundColor: color,
            transform: [{ rotate: "45deg" }],
          }}
        />
        <View
          style={{
            position: "absolute",
            left: 4.75,
            top: -0.5,
            width: 2.5,
            height: 13,
            borderRadius: 1,
            backgroundColor: color,
            transform: [{ rotate: "-45deg" }],
          }}
        />
      </View>
    </View>
  );
}

function Rules({ color }: { color: ColorValue }) {
  const page = {
    position: "absolute" as const,
    bottom: 10,
    width: 12,
    height: 14,
    backgroundColor: color,
    borderRadius: 1.5,
  };
  return (
    <View style={{ width: 26, height: 26 }}>
      <View
        style={[
          page,
          {
            left: 1,
            transformOrigin: "right bottom",
            transform: [{ rotate: "-22deg" }],
          },
        ]}
      />
      <View
        style={[
          page,
          {
            right: 1,
            transformOrigin: "left bottom",
            transform: [{ rotate: "22deg" }],
          },
        ]}
      />
    </View>
  );
}
