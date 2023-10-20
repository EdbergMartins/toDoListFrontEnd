
import { Route } from 'react-router-dom';

import { redirect } from "react-router-dom";
function PrivateRoutes({ component: Component, ...rest }) {


  return (
    <Route
      {...rest}
      render={(props) =>
        token ? (
          <Component {...props} />
        ) : (
          redirect('/')
        )
      }
    />
  );
}

export default PrivateRoutes;