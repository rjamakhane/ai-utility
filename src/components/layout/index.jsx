import { DrawerProvider } from "./DrawerContext"
import Main from "./Main"

export const RootLayout = () => {
    return (
        <DrawerProvider>
            <Main />
        </DrawerProvider>
    )
}

export default RootLayout;