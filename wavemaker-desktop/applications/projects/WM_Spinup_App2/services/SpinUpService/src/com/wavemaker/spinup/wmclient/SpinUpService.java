package com.wavemaker.spinup.wmclient;

import java.util.Hashtable;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.beans.factory.annotation.Autowired;

import com.wavemaker.spinup.web.SpinupController;
import com.wavemaker.spinup.web.LoginCredentialsBean;

import com.wavemaker.runtime.RuntimeAccess;
import com.wavemaker.runtime.javaservice.JavaServiceSuperClass;
import com.wavemaker.runtime.service.annotations.ExposeToClient;



@ExposeToClient
public class SpinUpService extends JavaServiceSuperClass {
   
       private SpinupController spinupController;
       private LoginCredentialsBean loginCredentials;
       private HttpServletRequest request;
       private HttpServletResponse response;
       private static int counter;
  
    public SpinUpService() {
       super(INFO);
    }

    public Hashtable<String, String> login(String username, String password) {
       Hashtable<String,String> result  = null;
       try {
          if(!username.contains("@vmware.com")){
              log(ERROR, "User: " + username + " NOT allowed");
              return null;
          }
          log(INFO, "Logging in user: = " + username );
          loginCredentials = new LoginCredentialsBean(username, password);
          request = RuntimeAccess.getInstance().getRequest();
          response = RuntimeAccess.getInstance().getResponse();
          result = spinupController.processLogin(loginCredentials, request, response);
          log(INFO, "Counter now: " + ++counter);
       } catch(Exception e) {
          log(ERROR, "Login has failed", e);
          log(ERROR, e.getMessage());
       }
       return result;
    }
    
    @Autowired
    @Required
    public void setSpinupController(SpinupController spinupController) {
        this.spinupController = spinupController;
    }

}