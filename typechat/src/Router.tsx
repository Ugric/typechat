import Home from "./pages/Home";
import Login from "./pages/Login";
import TandC from "./pages/T&C";
import Settings from "./pages/settings";
import Verify from "./pages/Verify";
import LinkDiscord from "./pages/LinkDiscord";
import Drive from "./pages/Drive";
import RequestNewPassword from "./pages/requestNewPassword";
import Blast from "./pages/blast";
import AddPeople from "./pages/addpeople";
import Contacts from "./pages/contacts";
import UserSettings from "./pages/usersettings";
import Error404 from "./pages/404";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import { Switch, Route, Redirect } from "react-router-dom";
import Christmas from "./pages/christmas";
import AdminPanel from "./pages/admin";

export default ({ chattingto }: { chattingto?: string }) => (
  <Switch>
    <Route path="/" exact>
      <Home />
    </Route>
    <Route path="/chat" exact>
      <Redirect to={chattingto ? `/chat/${chattingto}` : "/"} />
    </Route>
    <Route
      path="/chat/:id"
      render={({ match }) => (
        <Chat
          chattingto={match.params.id}
          key={match.params.id}
        />
      )}
      exact
    ></Route>
    <Route path="/contacts" exact>
      <Contacts />
    </Route>
    <Route path="/blast" exact>
      <Blast.Blast />
    </Route>
    <Route path="/T&C" exact>
      <TandC />
    </Route>
    <Route path="/verify/:id" exact>
      <Verify />
    </Route>
    <Route path="/settings" exact>
      <Settings />
    </Route>
    <Route path="/login" exact>
      <Login />
    </Route>
    <Route path="/christmas" exact>
      <Christmas></Christmas>
    </Route>
    <Route path="/link/:id" exact>
      <LinkDiscord />
    </Route>
    <Route path="/signup" exact>
      <Signup />
    </Route>
    <Route path="/user/drive" exact>
      <Drive.Drive />
    </Route>
    <Route path="/drive/:id" exact>
      <Drive.Image />
    </Route>
    <Route path="/requestNewPassword" exact>
      <RequestNewPassword.RequestNewPassword />
    </Route>
    <Route path="/updatepassword/:id" exact>
      <RequestNewPassword.ChangePassword />
    </Route>

    <Route path="/user/settings" exact>
      <UserSettings />
    </Route>
    <Route path="/add" exact>
      <AddPeople></AddPeople>
    </Route>
    <Route path="/admin" exact>
      <AdminPanel></AdminPanel>
    </Route>
    <Route>
      <Error404></Error404>
    </Route>
  </Switch>
);
